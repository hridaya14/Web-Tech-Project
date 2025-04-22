package orm


import (
    "log"
    "os"

    "github.com/joho/godotenv"
    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
)

var DB *sqlx.DB

func Init() {
    _ = godotenv.Load()
    dsn := os.Getenv("POSTGRES_STRING")

    var err error
    DB, err = sqlx.Connect("postgres", dsn)
    if err != nil {
        log.Fatalf("❌ Failed to connect to DB: %v", err)
    }

    log.Println("✅ Connected to PostgreSQL with sqlx")
}

