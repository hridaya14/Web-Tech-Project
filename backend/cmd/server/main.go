package main

import (
    "database/sql"
    "fmt"
    "log"
    "net/http"

    _ "github.com/lib/pq"
    "github.com/hridaya14/Web-Tech-Project/internal/server/handlers"
)

func main() {
    // Connect to NeonDB
    db, err := sql.Open("postgres", "postgresql://neondb_owner:npg_6mwFk7XyTlJj@ep-frosty-poetry-a11ztueg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
    if err != nil {
        log.Fatalf("❌ Failed to connect to NeonDB: %v", err)
    }
    
    if err = db.Ping(); err != nil {
        log.Fatalf("❌ Could not ping NeonDB: %v", err)
    }
    
    fmt.Println("✅ Connected to NeonDB successfully.")

    // Initialize handler's database setup
    if err := handlers.InitDB(db); err != nil {
        log.Fatalf("❌ Failed to initialize database setup: %v", err)
    }

	server, err := server.CreateServer()

	if err != nil {
		log.Fatal("Unable to start server!")
	}

	if err := server.Run(":5000"); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
	
}
