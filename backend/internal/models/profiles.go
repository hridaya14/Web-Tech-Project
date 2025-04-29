package models

import (
	"time"

	"github.com/google/uuid"
)

// Database Definitions
type Candidate struct {
	ID            uuid.UUID `json:"id" db:"id"`
	UserID        int       `json:"user_id" db:"user_id"`
	FullName      string    `json:"full_name" db:"full_name"`
	Location      string    `json:"location"  db:"location"`
	PhoneNumber   string    `json:"phone_number" db:"phone"`
	LinkedInURL   *string   `json:"linkedin_url" db:"linkedin_url"`   // nullable
	PortfolioURL  *string   `json:"portfolio_url" db:"portfolio_url"` // nullable
	ResumeURL     string    `json:"resume_url" db:"resume_url"`
	Skills        []string  `json:"skills" db:"skills"`
	Experience    int       `json:"experience_years" db:"experience_years"`
	ExpectedRoles []string  `json:"expected_roles" db:"expected_roles"` // ARRAY
	CurrentStatus string    `json:"current_status" db:"current_status"` // ENUM
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type Company struct {
	ID                 uuid.UUID `json:"id" db:"id"`
	UserID             int       `json:"user_id" db:"user_id"`
	CompanyName        string    `json:"company_name" db:"company_name"`
	WebsiteURL         string    `json:"website_url" db:"company_website"` // nullable
	CompanySize        string    `json:"company_size" db:"company_size"`
	Industry           string    `json:"industry" db:"industry"`
	ContactPerson      string    `json:"contact_person" db:"contact_person"`
	ContactPhone       string    `json:"contact_phone" db:"contact_phone"`
	CompanyDescription string    `json:"company_description" db:"company_description"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
}

//Handler Definitions

type CandidateRequest struct {
	FullName        string   `json:"full_name" binding:"required"`
	Phone           string   `json:"phone_number,omitempty"`
	Location        string   `json:"location,omitempty"`
	LinkedInURL     string   `json:"linkedin_url,omitempty"`
	PortfolioURL    string   `json:"portfolio_url,omitempty"`
	ResumeURL       string   `json:"resume_url,omitempty"`
	Skills          []string `json:"skills,omitempty"`
	ExperienceYears int      `json:"experience_years,omitempty"`
	ExpectedRole    []string `json:"expected_roles" binding:"required"`
	CurrentStatus   string   `json:"current_status" binding:"required"`
}

type CompanyRequest struct {
	CompanyName        string `json:"company_name" binding:"required"`
	CompanyWebsite     string `json:"company_website,omitempty"`
	CompanySize        string `json:"company_size,omitempty"` // Enum: SMALL, MEDIUM, LARGE
	Industry           string `json:"industry,omitempty"`
	ContactPerson      string `json:"contact_person,omitempty"`
	ContactPhone       string `json:"contact_phone,omitempty"`
	CompanyDescription string `json:"company_description,omitempty"`
}
