package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"net/http"
	"strings"
)

func GetFilteredJobListings(c *gin.Context) {
	var filters models.JobListingFilters

	if err := c.ShouldBindQuery(&filters); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid filter parameters",
		})
		return
	}

	skillsParam := c.Query("required_skills")
	if skillsParam != "" {
		filters.RequiredSkills = strings.Split(skillsParam, ",")
	}

	listings, err := database.GetJobListings(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch job listings",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"listings": listings,
		"count":    len(listings),
	})
}

func CreateJobApplication(c *gin.Context) {

	candidateID, _, ok := GetAuthenticatedID(c)
	if !ok {
		return
	}

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

	candidateID, _, ok := GetAuthenticatedID(c)
	if !ok {
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

type deleteApplicationRequest struct {
	ApplicationID string `json:"application_id" binding:"required"`
}

func DeleteApplication(c *gin.Context) {
	candidateID, _, ok := GetAuthenticatedID(c)
	if !ok {
		return
	}

	var req deleteApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid application_id"})
		return
	}

	applicationID, err := uuid.Parse(req.ApplicationID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application_id format"})
		return
	}

	err = database.DeleteApplicationByID(applicationID, candidateID)
	if err != nil {
		switch err.Error() {
		case "unauthorized: candidate does not own this application or it does not exist":
			// Treat as forbidden (if you want not found, swap with below)
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this application"})
		case "application not found or already deleted":
			c.JSON(http.StatusNotFound, gin.H{"error": "Application not found or already deleted"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete application"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Application deleted successfully"})
}
