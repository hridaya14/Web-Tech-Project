package database

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/orm"
	"github.com/lib/pq"
	"log"
	"time"
)

func CreateCandidate(candidate models.CandidateRequest, userID int) (models.Candidate, error) {
	// Generate a UUID for the candidate
	candidateID := uuid.New()

	// SQL query to insert the candidate into the database
	query := `
		INSERT INTO candidates (id, user_id, full_name, phone, location, linkedin_url, portfolio_url, resume_url, skills, experience_years, expected_roles, current_status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, user_id, full_name, location, phone, linkedin_url, portfolio_url, resume_url, skills, experience_years, expected_roles, current_status, created_at;
	`

	// Preparing the data to be inserted
	createdAt := time.Now()

	var skillsArray []string
	if len(candidate.Skills) > 0 {
		skillsArray = candidate.Skills
	}

	// Use the candidate's ExpectedRoles array
	var expectedRolesArray []string
	if len(candidate.ExpectedRole) > 0 {
		expectedRolesArray = candidate.ExpectedRole
	}

	// Execute the query
	var c models.Candidate
	var skills pq.StringArray
	var expectedRoles pq.StringArray
	err := orm.DB.QueryRow(query,
		candidateID,                        // UUID for the candidate
		userID,                             // User ID (foreign key)
		candidate.FullName,                 // Full name
		candidate.Phone,                    // Phone number
		candidate.Location,                 // Location
		candidate.LinkedInURL,              // LinkedIn URL
		candidate.PortfolioURL,             // Portfolio URL
		candidate.ResumeURL,                // Resume URL
		pq.StringArray(skillsArray),        // Skills
		candidate.ExperienceYears,          // Experience years
		pq.StringArray(expectedRolesArray), // Expected roles (array)
		candidate.CurrentStatus,            // Current status
		createdAt,                          // CreatedAt timestamp
	).Scan(&c.ID, &c.UserID, &c.FullName, &c.Location, &c.PhoneNumber, &c.LinkedInURL, &c.PortfolioURL, &c.ResumeURL, &skills, &c.Experience, &expectedRoles, &c.CurrentStatus, &c.CreatedAt)

	if err != nil {
		log.Printf("Error creating candidate: %v", err)
		return models.Candidate{}, fmt.Errorf("could not create candidate: %w", err)
	}

	return c, nil
}

func CreateCompany(company models.CompanyRequest, userID int) (models.Company, error) {
	// Generate a UUID for the company
	companyID := uuid.New()

	// SQL query to insert the company into the database
	query := `
		INSERT INTO companies (id, user_id, company_name, company_website, company_size, industry, contact_person, contact_phone, company_description)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, company_name, company_website, company_size, industry, contact_person, contact_phone, company_description, created_at, updated_at;
	`

	// Preparing the data to be inserted
	_, err := orm.DB.Exec(query,
		companyID,                  // UUID for the company
		userID,                     // User ID (foreign key)
		company.CompanyName,        // Company name from the request
		company.CompanyWebsite,     // Company website URL
		company.CompanySize,        // Company size (Enum)
		company.Industry,           // Industry
		company.ContactPerson,      // Contact person
		company.ContactPhone,       // Contact phone
		company.CompanyDescription, // Company description
	)

	if err != nil {
		log.Printf("Error creating company: %v", err)
		return models.Company{}, fmt.Errorf("could not create company: %w", err)
	}

	// You can return the created company details
	return models.Company{
		ID:                 companyID,
		UserID:             userID,
		CompanyName:        company.CompanyName,
		WebsiteURL:         company.CompanyWebsite,
		CompanySize:        company.CompanySize,
		Industry:           company.Industry,
		ContactPerson:      company.ContactPerson,
		ContactPhone:       company.ContactPhone,
		CompanyDescription: company.CompanyDescription,
	}, nil
}
