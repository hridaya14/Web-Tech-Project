package handlers

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/bucket"
	"net/http"
	"strconv"
	"strings"
)

func GetProfile(c *gin.Context) {
	// Get the user context
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

	username := userContext.Username

	// Fetch user details
	user, err := database.GetUserByUsername(username)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"Message": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"Message": "Database error"})
		}
		return
	}

	needsOnboarding := user.OnboardingStatus == "NOT_STARTED" || user.OnboardingStatus == "IN_PROGRESS"

	var profile interface{} = gin.H{}

	if !needsOnboarding {
		rawID, err := database.GetUserRelatedID(userContext.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to process request"})
			return
		}

		relatedID, ok := rawID.(uuid.UUID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid ID format returned from database"})
			return
		}

		if user.Role == "candidate" {
			candidate, err := database.GetCandidateByID(relatedID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch candidate profile"})
				return
			}
			profile = gin.H{
				"full_name":      candidate.FullName,
				"location":       candidate.Location,
				"phone_number":   candidate.PhoneNumber,
				"linkedin_url":   candidate.LinkedInURL,
				"portfolio_url":  candidate.PortfolioURL,
				"resume_url":     candidate.ResumeURL,
				"skills":         candidate.Skills,
				"experience":     candidate.Experience,
				"expected_roles": candidate.ExpectedRoles,
				"current_status": candidate.CurrentStatus,
			}
		} else if user.Role == "company" {
			company, err := database.GetCompanyByID(relatedID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch company profile"})
				return
			}
			profile = gin.H{
				"company_name":        company.CompanyName,
				"website_url":         company.WebsiteURL,
				"company_size":        company.CompanySize,
				"industry":            company.Industry,
				"contact_person":      company.ContactPerson,
				"contact_phone":       company.ContactPhone,
				"company_description": company.CompanyDescription,
			}
		}
	}

	// Return the user profile
	c.JSON(http.StatusOK, gin.H{
		"username":        user.Username,
		"email":           user.Email,
		"role":            user.Role,
		"needsOnboarding": needsOnboarding,
		"profile":         profile,
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

	database.UpdateOnboardingStatus(userContext.ID, "IN_PROGRESS")

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

	// postPayload := map[string]interface{}{
	// 	"user_id":      userContext.ID,
	// 	"resume_url":   uploadedURL,
	// 	"query_skills": input.Skills,
	// }

	// // Marshal to JSON
	// jsonData, err := json.Marshal(postPayload)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"Message": "Failed to marshal JSON", "Error": err.Error()})
	// 	return
	// }
	//
	// // Send POST request to external service
	// postURL := "http://0.0.0.0:8000/onboarding/candidate"
	// // Replace with actual endpoint
	// req, err := http.NewRequest("POST", postURL, bytes.NewBuffer(jsonData))
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"Message": "Failed to create request", "Error": err.Error()})
	// 	return
	// }
	// req.Header.Set("Content-Type", "application/json")
	//
	// client := &http.Client{}
	// resp, err := client.Do(req)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"Message": "Request failed", "Error": err.Error()})
	// 	return
	// }
	// defer resp.Body.Close()
	//
	// if resp.StatusCode != http.StatusOK {
	// 	body, _ := io.ReadAll(resp.Body)
	// 	c.JSON(http.StatusBadGateway, gin.H{"Message": "External request failed", "Response": string(body)})
	// 	return
	// }
	//
	database.UpdateOnboardingStatus(userContext.ID, "COMPLETED")

	c.JSON(http.StatusOK, gin.H{"Message": "Candidate created successfully", "Candidate": candidate})
}

func CreateCompanyProfile(c *gin.Context) {
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

	database.UpdateOnboardingStatus(userContext.ID, "IN_PROGRESS")

	var input models.CompanyRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	company, err := database.CreateCompany(input, userContext.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Message": "Unable to create company"})
		return
	}

	// Update onboarding status
	database.UpdateOnboardingStatus(userContext.ID, "COMPLETED")

	c.JSON(http.StatusCreated, gin.H{"Message": "Created company profile successfully!",
		"name": company.CompanyName})

}
