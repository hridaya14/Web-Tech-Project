package server

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func CreateServer() (*gin.Engine, error) {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, 
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	_, err := registerRoutes(router)
	if err != nil {
		return nil, err
	}

	// ✅ Do NOT call router.Run here. Let main() handle it.
	return router, nil
}
