package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
)

func GetProfile(c *gin.Context) {
	// Get the username from the Gin context (set by the middleware)
	usernameVal, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Username not found in context"})
		return
	}

	username := usernameVal.(string)

	// Fetch user details from the database using a separate function
	user, err := database.GetUserByUsername(username)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"Message": "User not found"})
			fmt.Print("Unable to find user")
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"Message": "Database error"})
		}
		return
	}

	// Return the user's profile details
	c.JSON(http.StatusOK, gin.H{
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
	})
}
