package handlers

import (
    "database/sql"
    "fmt"
    "io"
    "net/http"
    "os"
    "path/filepath"
    "time"

    _ "github.com/lib/pq" // PostgreSQL driver
)

const (
    // Exported constants (capitalized)
    MaxUploadSize = 10 << 20 // 10 MB
    UploadPath    = "./uploads"
)

// DB needs to be exported so it can be set from main
var DB *sql.DB

// InitDB creates necessary directories and tables
// This function should be called from main.go
func InitDB(dbConnection *sql.DB) error {
    // Store the database connection passed from main
    DB = dbConnection
    
    // Create upload directory if not exists
    if err := os.MkdirAll(UploadPath, os.ModePerm); err != nil {
        return fmt.Errorf("failed to create upload directory: %v", err)
    }

    // Create table if not exists
    _, err := DB.Exec(`CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        job_id TEXT,
        filename TEXT,
        uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )`)
    if err != nil {
        return fmt.Errorf("failed to create table: %v", err)
    }

    return nil
}

// UploadResume - Capitalized to export the function
func UploadResume(w http.ResponseWriter, r *http.Request) {
    if err := r.ParseMultipartForm(MaxUploadSize); err != nil {
        http.Error(w, "File too large", http.StatusBadRequest)
        return
    }

    jobID := r.FormValue("jobID")
    if jobID == "" {
        http.Error(w, "Job ID required", http.StatusBadRequest)
        return
    }

    file, handler, err := r.FormFile("resume")
    if err != nil {
        http.Error(w, "Invalid file", http.StatusBadRequest)
        return
    }
    defer file.Close()

    allowedTypes := map[string]bool{
        "application/pdf":  true,
        "application/msword": true,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
    }
    if !allowedTypes[handler.Header.Get("Content-Type")] {
        http.Error(w, "Invalid file type. Only PDF and DOC/DOCX allowed", http.StatusBadRequest)
        return
    }

    ext := filepath.Ext(handler.Filename)
    newFileName := fmt.Sprintf("%s_%d%s", jobID, time.Now().UnixNano(), ext)
    filePath := filepath.Join(UploadPath, newFileName)

    dst, err := os.Create(filePath)
    if err != nil {
        http.Error(w, "Failed to create file", http.StatusInternalServerError)
        return
    }
    defer dst.Close()

    if _, err := io.Copy(dst, file); err != nil {
        http.Error(w, "Failed to save file", http.StatusInternalServerError)
        return
    }

    _, err = DB.Exec("INSERT INTO resumes (job_id, filename) VALUES ($1, $2)", jobID, newFileName)
    if err != nil {
        http.Error(w, "Failed to save metadata", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    fmt.Fprintf(w, "Resume uploaded successfully for Job ID: %s", jobID)
}
