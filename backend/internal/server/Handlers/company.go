package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
)

func CreateJob(c *gin.Context) {

	value, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "User not found in context"})
		return
	}

	// Type assert
	userContext, ok := value.(*models.AuthenticatedUser)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user context type"})
		return
	}

	var input models.JobListingRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	companyID, err := database.GetUserRelatedID(userContext.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	id, ok := companyID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user context type"})
		return
	}

	listing, err := database.CreateJobListing(input, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"Message": "Successfully created listing",
		"Listing Details": gin.H{
			"Name": listing.Listing_title,
		},
	})
}

func GetJobListings(c *gin.Context) {
	// Get user from the context (assuming it's already set during authentication)
	value, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "User not found in context"})
		return
	}

	// Type assert to get user context
	userContext, ok := value.(*models.AuthenticatedUser)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user context type"})
		return
	}

	// Fetch the company ID associated with the user
	companyID, err := database.GetUserRelatedID(userContext.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	// Type assert the companyID (uuid.UUID)
	id, ok := companyID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid user context type"})
		return
	}

	// Get the job listings for the company from the database
	listings, err := database.GetJobListingsByCompanyID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch job listings"})
		return
	}

	// Return the listings as a JSON response
	c.JSON(http.StatusOK, gin.H{
		"Message":  "Successfully fetched job listings",
		"Listings": listings,
	})
}

func GetCompanyApplicants(c *gin.Context) {
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
		log.Printf("Error %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	companyID, ok := rawID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid ID format returned from database"})
		return
	}

	applications, err := database.GetApplicantPoolsByCompanyID(companyID)
	if err != nil {
		log.Printf("Error %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}
