package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"log"
	"net/http"
)

func GetAuthenticatedID(c *gin.Context) (uuid.UUID, *models.AuthenticatedUser, bool) {
	value, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found in context"})
		return uuid.UUID{}, nil, false
	}

	userContext, ok := value.(*models.AuthenticatedUser)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid user context type"})
		return uuid.UUID{}, nil, false
	}

	rawID, err := database.GetUserRelatedID(userContext.ID)
	if err != nil {
		log.Printf("Error %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return uuid.UUID{}, nil, false
	}

	candidateID, ok := rawID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid ID format returned from database"})
		return uuid.UUID{}, nil, false
	}

	return candidateID, userContext, true
}
