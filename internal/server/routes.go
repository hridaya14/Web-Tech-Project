package server

import (
	"github.com/gin-gonic/gin"
	handlers "github.com/hridaya14/Web-Tech-Project/internal/server/Handlers"
)

func registerRoutes(router *gin.Engine) (*gin.Engine, error) {

	router.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to the server !!")
	})
	router.POST("/login", handlers.LoginHandler)

	return router, nil
}
