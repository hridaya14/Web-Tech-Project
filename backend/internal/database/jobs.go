package database

import (
	"database/sql"
	"fmt"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/orm"
	"github.com/lib/pq"
	"log"
)

type JobListingFilters struct {
	Query           string
	WorkType        string
	JobType         string
	ExperienceLevel string
	RequiredSkills  []string
}

func CreateJobListing(Listing models.JobListingRequest, company_id uuid.UUID) (models.JobListing, error) {

	query := `
		INSERT INTO job_listings (company_id, title, description, location, work_type, job_type, experience_level, experience_months, salary_range, required_skills)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING *
	`

	var skillsArray []string
	if len(Listing.Required_skills) > 0 {
		skillsArray = Listing.Required_skills
	}

	var l models.JobListing

	err := orm.DB.Get(&l, query,
		company_id,
		Listing.Listing_title,
		Listing.Description,
		Listing.Location,
		Listing.Work_type,
		Listing.Job_type,
		Listing.Experience_type,
		Listing.Experience_months,
		Listing.Salary_range,
		pq.StringArray(skillsArray),
	)

	if err != nil {
		log.Printf("Error creating job listing  : %v", err)
		return models.JobListing{}, fmt.Errorf("Could not create listing: %w", err)
	}

	return l, nil

}

func GetJobListingByID(listingID uuid.UUID) (models.JobListing, error) {
	var listing models.JobListing

	query := `SELECT * FROM job_listings WHERE id = $1`

	err := orm.DB.Get(&listing, query, listingID)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.JobListing{}, fmt.Errorf("job listing not found")
		}
		log.Printf("Error fetching listing by ID: %v", err)
		return models.JobListing{}, fmt.Errorf("could not fetch listing: %w", err)
	}

	return listing, nil
}

func GetJobListingsByCompanyID(companyID uuid.UUID) ([]models.JobListing, error) {
	var listings []models.JobListing

	query := `SELECT * FROM job_listings WHERE company_id = $1 ORDER BY created_at DESC`

	err := orm.DB.Select(&listings, query, companyID)
	if err != nil {
		log.Printf("Error fetching listings for company: %v", err)
		return nil, fmt.Errorf("could not fetch listings: %w", err)
	}

	return listings, nil
}

func DeleteJobListingByID(listingID, companyID uuid.UUID) error {
	listing, err := GetJobListingByID(listingID)
	if err != nil {
		return err
	}

	if listing.Company_id != companyID {
		return fmt.Errorf("unauthorized: this company does not own the job listing")
	}

	query := `DELETE FROM job_listings WHERE id = $1`
	result, err := orm.DB.Exec(query, listingID)
	if err != nil {
		log.Printf("Error deleting job listing: %v", err)
		return fmt.Errorf("could not delete job listing: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error fetching rows affected: %v", err)
		return fmt.Errorf("could not verify job listing deletion: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("job listing could not be deleted (already removed?)")
	}

	return nil
}
