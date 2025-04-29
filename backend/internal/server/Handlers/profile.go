package handlers

import (
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/bucket"
	"log"
	"net/http"
	"strconv"
	"strings"
)

func GetProfile(c *gin.Context) {
	// Get the username from the Gin context (set by the middleware)
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

	username := userContext.Username

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

	log.Printf("User : %+v", user)

	needsOnboarding := user.OnboardingStatus == "NOT_STARTED" || user.OnboardingStatus == "IN_PROGRESS"

	// Return the user's profile details
	c.JSON(http.StatusOK, gin.H{
		"username":        user.Username,
		"email":           user.Email,
		"role":            user.Role,
		"needsOnboarding": needsOnboarding,
	})
}

func CreateCandidateProfile(c *gin.Context) {
	// Get the authenticated user
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

	// Parse multipart form (10 MB max)
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Message": "Failed to parse form", "Error": err.Error()})
		return
	}

	// Extract form values
	var input models.CandidateRequest
	input.FullName = c.PostForm("full_name")
	input.Phone = c.PostForm("phone")
	input.Location = c.PostForm("location")
	input.LinkedInURL = c.PostForm("linkedin_url")   // now string
	input.PortfolioURL = c.PostForm("portfolio_url") // now string
	input.CurrentStatus = c.PostForm("current_status")

	// Convert experience years to int
	if exp := c.PostForm("experience_years"); exp != "" {
		if years, err := strconv.Atoi(exp); err == nil {
			input.ExperienceYears = years
		}
	}

	// Parse comma-separated lists (handle empty string case gracefully)
	if skills := c.PostForm("skills"); skills != "" {
		input.Skills = strings.Split(skills, ",")
	}
	if roles := c.PostForm("expected_roles"); roles != "" {
		input.ExpectedRole = strings.Split(roles, ",")
	}

	// Handle resume file upload
	file, fileHeader, err := c.Request.FormFile("resume_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Message": "Resume file required", "Error": err.Error()})
		return
	}
	defer file.Close()

	// Initialize S3 uploader
	uploader, err := bucket.NewUploader() // Replace with your S3 bucket
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize S3 uploader"})
		return
	}

	uploadedURL, err := uploader.UploadFile(file, fileHeader, "resumes")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Message": "Failed to upload resume", "Error": err.Error()})
		return
	}
	input.ResumeURL = uploadedURL

	// Save candidate to DB
	candidate, err := database.CreateCandidate(input, userContext.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Message": "Could not create candidate", "Error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"Message": "Candidate created successfully", "Candidate": candidate})
}
