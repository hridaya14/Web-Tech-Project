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

func CreateCandidate(candidate models.CandidateRequest, userID uuid.UUID) (models.Candidate, error) {

	query := `
		INSERT INTO candidates (user_id, full_name, phone, location, linkedin_url, portfolio_url, resume_url, skills, experience_years, expected_role, current_status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, user_id, full_name, location, phone, linkedin_url, portfolio_url, resume_url, skills, experience_years, expected_role, current_status, created_at;
	`

	// Preparing the data to be inserted
	createdAt := time.Now()

	var skillsArray []string
	if len(candidate.Skills) > 0 {
		skillsArray = candidate.Skills
	}

	expectedRole := candidate.ExpectedRole[0]
	// Execute the query
	var c models.Candidate
	var skills pq.StringArray
	err := orm.DB.QueryRow(query,
		userID,                      // User ID (foreign key)
		candidate.FullName,          // Full name
		candidate.Phone,             // Phone number
		candidate.Location,          // Location
		candidate.LinkedInURL,       // LinkedIn URL
		candidate.PortfolioURL,      // Portfolio URL
		candidate.ResumeURL,         // Resume URL
		pq.StringArray(skillsArray), // Skills
		candidate.ExperienceYears,   // Experience years
		expectedRole,                // Expected roles (array)
		candidate.CurrentStatus,     // Current status
		createdAt,                   // CreatedAt timestamp
	).Scan(&c.ID, &c.UserID, &c.FullName, &c.Location, &c.PhoneNumber, &c.LinkedInURL, &c.PortfolioURL, &c.ResumeURL, &skills, &c.Experience, &expectedRole, &c.CurrentStatus, &c.CreatedAt)

	if err != nil {
		log.Printf("Error creating candidate: %v", err)
		return models.Candidate{}, fmt.Errorf("could not create candidate: %w", err)
	}

	return c, nil
}

func CreateCompany(company models.CompanyRequest, userID uuid.UUID) (models.Company, error) {

	query := `
		INSERT INTO companies (user_id, company_name, company_website, company_size, industry, contact_person, contact_phone, company_description)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, company_name, company_website, company_size, industry, contact_person, contact_phone, company_description, created_at, updated_at;
	`

	// Preparing the data to be inserted
	_, err := orm.DB.Exec(query,
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

func GetCandidateByID(candidateID uuid.UUID) (models.Candidate, error) {
	var candidate models.Candidate

	query := `
		SELECT id, user_id, full_name, location, phone, linkedin_url, portfolio_url, resume_url,
		       skills, experience_years, expected_role, current_status, created_at
		FROM candidates
		WHERE id = $1
	`

	err := orm.DB.Get(&candidate, query, candidateID)
	if err != nil {
		log.Printf("Error fetching candidate profile: %v", err)
		return models.Candidate{}, fmt.Errorf("could not fetch candidate profile: %w", err)
	}

	return candidate, nil
}

func GetCompanyByID(companyID uuid.UUID) (models.Company, error) {
	var company models.Company

	query := `
		SELECT id, user_id, company_name, company_website, company_size, industry,
		       contact_person, contact_phone, company_description, created_at
		FROM companies
		WHERE id = $1
	`

	err := orm.DB.Get(&company, query, companyID)
	if err != nil {
		log.Printf("Error fetching company profile: %v", err)
		return models.Company{}, fmt.Errorf("could not fetch company profile: %w", err)
	}

	return company, nil
}
