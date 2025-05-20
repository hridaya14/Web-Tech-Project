package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"log"
	"net/http"
)

func CreateJob(c *gin.Context) {
	companyID, _, ok := GetAuthenticatedID(c)
	if !ok {
		return
	}

	var input models.JobListingRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	company, err := database.GetCompanyByID(companyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	listing, err := database.CreateJobListing(input, companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
		return
	}

	if ok := StoreListing(
		listing.ID.String(),
		company.CompanyName,
		listing.Description,
		listing.Listing_title,
		listing.Experience_months,
		listing.Required_skills,
	); !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"Message": "Failed to store job listing externally"})
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
	companyID, _, ok := GetAuthenticatedID(c)
	if !ok {
		return
	}

	listings, err := database.GetJobListingsByCompanyID(companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch job listings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Message":  "Successfully fetched job listings",
		"Listings": listings,
	})
}

type getJobDetailsRequest struct {
	JobID string `json:"job_id" binding:"required"`
}

func GetJobDetailsHandler(c *gin.Context) {
	jobIDParam := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job_id format"})
		return
	}

	job, err := database.GetJobListingByID(jobID)
	if err != nil {
		if err.Error() == "job listing not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job listing not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch job details"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"job": job})
}

func GetCompanyApplicants(c *gin.Context) {

	companyID, _, ok := GetAuthenticatedID(c)
	if !ok {
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

type deleteListingRequest struct {
	ListingID string `json:"listing_id" binding:"required"`
}

func DeleteCompanyListing(c *gin.Context) {

	companyID, _, ok := GetAuthenticatedID(c)
	if !ok {
		return
	}

	var req deleteListingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid listing_id"})
		return
	}

	listingID, err := uuid.Parse(req.ListingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing_id format"})
		return
	}

	// Call your delete logic
	err = database.DeleteJobListingByID(listingID, companyID)
	if err != nil {
		if err.Error() == "unauthorized: this company does not own the job listing" {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this listing"})
			return
		}
		if err.Error() == "job listing not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing deleted successfully"})
}
