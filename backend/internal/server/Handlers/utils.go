package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"log"
	"math"
	"net/http"
	"os"
	"time"
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

var baseURL = os.Getenv("EXTERNAL_SERVICE_BASE_URL")

func StoreProfile(userID string, resumeURL string, skills []string) bool {
	payload := map[string]interface{}{
		"user_id":      userID,
		"resume_url":   resumeURL,
		"query_skills": skills,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return false
	}

	url := baseURL + "/onboarding/candidate"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return false
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode >= 200 && resp.StatusCode < 300
}

func StoreListing(
	jobID string,
	companyName string,
	jobDesc string,
	requiredRole string,
	experienceMonths int,
	requiredSkills []string,
) bool {
	payload := map[string]interface{}{
		"job_id":            jobID,
		"company_name":      companyName,
		"job_desc":          jobDesc,
		"required_role":     requiredRole,
		"experience_months": experienceMonths,
		"required_skills":   requiredSkills,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return false
	}

	url := baseURL + "/onboarding/job-listing"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return false
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode >= 200 && resp.StatusCode < 300
}

func GetJobListingScore(candidateID string, jobID string) (int, error) {
	payload := map[string]string{
		"candidate_id": candidateID,
		"job_id":       jobID,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return 0, err
	}

	url := baseURL + "/job-listing-score"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return 0, errors.New("external service returned non-2xx status")
	}

	var response struct {
		ListingScore float64 `json:"listing_score"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return 0, err
	}

	roundedScore := int(math.Round(response.ListingScore * 100)) // e.g., 0.5333 → 53
	return roundedScore, nil
}
