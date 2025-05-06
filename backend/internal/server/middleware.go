package server

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/auth"
	"net/http"
)

func authenticateMiddleware(c *gin.Context) {

	// Retrieve the token from the cookie
	tokenString, err := c.Cookie("token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "No cookie"})
		c.Abort()
		return
	}

	// Verify the token
	token, err := auth.VerifyToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Failed to validate token"})
		c.Abort()
		return
	}

	// Extract claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid token"})
		c.Abort()
		return
	}

	username, ok := claims["sub"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid username claim"})
		c.Abort()
		return
	}

	userIDStr, ok := claims["user"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user ID claim"})
		c.Abort()
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user ID format"})
		c.Abort()
		return
	}

	c.Set("user", &models.AuthenticatedUser{
		ID:       userID,
		Username: username,
	})
	// Continue with the next middleware or handler
	c.Next()
}
