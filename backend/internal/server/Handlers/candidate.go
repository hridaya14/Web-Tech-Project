package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
)

func GetFilteredJobListings(c *gin.Context) {
	var filters models.JobListingFilters

	// Bind query parameters to the filters struct
	if err := c.ShouldBindQuery(&filters); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid filter parameters",
		})
		return
	}

	// Handle required_skills as it will be passed as a comma-separated string
	skillsParam := c.Query("required_skills")
	if skillsParam != "" {
		// If skills were provided, split them by comma
		filters.RequiredSkills = strings.Split(skillsParam, ",")
	}

	// Call the database function to get filtered listings
	listings, err := database.GetJobListings(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch job listings",
		})
		return
	}

	// Return the listings
	c.JSON(http.StatusOK, gin.H{
		"listings": listings,
		"count":    len(listings),
	})
}

func CreateJobApplication(c *gin.Context) {
	value, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "User not found in context"})
		return
	}

	userContext, ok := value.(*models.AuthenticatedUser)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user context type"})
		return
	}

	rawID, err := database.GetUserRelatedID(userContext.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	candidateID, ok := rawID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid ID format returned from database"})
		return
	}

	// Parse jobID from JSON body
	var requestBody struct {
		JobID string `json:"jobId"`
	}

	if err := c.BindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	jobID, err := uuid.Parse(requestBody.JobID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	// Create application
	err = database.CreateApplication(candidateID, jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create application"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Application submitted successfully"})
}

func GetCandidateApplications(c *gin.Context) {

	value, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "User not found in context"})
		return
	}

	userContext, ok := value.(*models.AuthenticatedUser)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user context type"})
		return
	}

	rawID, err := database.GetUserRelatedID(userContext.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	candidateID, ok := rawID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid ID format returned from database"})
		return
	}

	applications, err := database.GetApplicationsByCandidateID(candidateID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})

}

func GetCandidateHandler(c *gin.Context) {
	idParam := c.Param("id")
	candidateID, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	candidate, err := database.GetCandidateByID(candidateID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch candidate"})
		return
	}

	if candidate.ID == uuid.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "candidate not found"})
		return
	}

	c.JSON(http.StatusOK, candidate)
}
