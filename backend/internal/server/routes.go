package server

import (
	"net/http"
	"github.com/gin-gonic/gin"
	handlers "github.com/hridaya14/Web-Tech-Project/internal/server/Handlers"
)

func registerRoutes(router *gin.Engine) (*gin.Engine, error) {

	router.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to the server !!")
	})

	// Auth Handlers
	router.POST("/auth/login", handlers.LoginHandler)
	router.POST("/auth/register", handlers.RegisterHandler)
	router.GET("/home", authenticateMiddleware, func(g *gin.Context) {
		g.JSON(http.StatusOK, gin.H{"Message ": "Welcome!!"})
	})

	//Profile Onboarding
	router.GET("/getProfile", authenticateMiddleware, handlers.GetProfile)
	router.POST("/profile/createCandidate", authenticateMiddleware, handlers.CreateCandidateProfile)

	//Job Seeker

	//Company

	return router, nil
}
