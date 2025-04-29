package server

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func CreateServer() (*gin.Engine, error) {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},                            // Allow specific origin (frontend URL)
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},                      // Allow HTTP methods
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"}, // Allow specific headers
		AllowCredentials: true,                                                          // Allow cookies to be sent with the request
		ExposeHeaders:    []string{"Content-Length"},                                    // Expose specific headers
		MaxAge:           12 * time.Hour,                                                // Cache preflight requests for 12 hours
	}))

	_, err := registerRoutes(router)
	if err != nil {
		return nil, err
	}

	// ✅ Do NOT call router.Run here. Let main() handle it.
	return router, nil
}
