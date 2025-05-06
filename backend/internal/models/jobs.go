package models

import (
	"github.com/google/uuid"
	"github.com/lib/pq"
	"time"
)

// Handler models
type JobListingRequest struct {
	Listing_title     string   `json:"Listing_title"`
	Description       string   `json:"description"`
	Location          string   `json:"location"`
	Work_type         string   `json:"work_type"`
	Job_type          string   `json:"job_type"`
	Experience_type   string   `json:"experience_type"`
	Experience_months string   `json:"experience_months"`
	Salary_range      string   `json:"salary_range"`
	Required_skills   []string `json:"required_skills"`
}

// Database models
type JobListing struct {
	ID                uuid.UUID      `db:"id"`
	Company_id        uuid.UUID      `db:"company_id"`
	Listing_title     string         `db:"title"`
	Description       string         `db:"description"`
	Location          string         `db:"location"`
	Work_type         string         `db:"work_type"`
	Job_type          string         `db:"job_type"`
	Experience_type   string         `db:"experience_level"`
	Experience_months string         `db:"experience_months"`
	Salary_range      string         `db:"salary_range"`
	Required_skills   pq.StringArray `db:"required_skills"`
	CreatedAt         time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time      `db:"updated_at"`
}

type JobListingFilters struct {
	WorkType        string
	JobType         string
	ExperienceLevel string
	SalaryRange     string
	RequiredSkills  []string
}
