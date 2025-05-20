package database

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/orm"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"log"
)

func GetJobListings(filters models.JobListingFilters) ([]models.JobListing, error) {
	var listings []models.JobListing

	baseQuery := `
		SELECT * FROM job_listings
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	if filters.WorkType != "" {
		baseQuery += fmt.Sprintf(" AND work_type = $%d", argIndex)
		args = append(args, filters.WorkType)
		argIndex++
	}

	if filters.JobType != "" {
		baseQuery += fmt.Sprintf(" AND job_type = $%d", argIndex)
		args = append(args, filters.JobType)
		argIndex++
	}

	if filters.ExperienceLevel != "" {
		baseQuery += fmt.Sprintf(" AND experience_level = $%d", argIndex)
		args = append(args, filters.ExperienceLevel)
		argIndex++
	}

	if filters.SalaryRange != "" {
		baseQuery += fmt.Sprintf(" AND salary_range = $%d", argIndex)
		args = append(args, filters.SalaryRange)
		argIndex++
	}

	if len(filters.RequiredSkills) > 0 {
		baseQuery += fmt.Sprintf(" AND required_skills && $%d", argIndex)
		args = append(args, pq.StringArray(filters.RequiredSkills))
		argIndex++
	}

	baseQuery += " ORDER BY created_at DESC"

	err := orm.DB.Select(&listings, baseQuery, args...)
	if err != nil {
		log.Printf("Error fetching listings: %v", err)
		return nil, fmt.Errorf("could not fetch listings: %w", err)
	}

	return listings, nil
}

func CreateApplication(candidateID uuid.UUID, jobID uuid.UUID, score int) error {

	query := `
        INSERT INTO applications (candidate_id, job_id, score)
        VALUES ($1, $2, $3)
    `
	_, err := orm.DB.Exec(query, candidateID, jobID, score)
	return err

}

func GetApplicationsByCandidateID(candidateID uuid.UUID) ([]models.Application, error) {
	query := `
        SELECT application_id, candidate_id, job_id, score, status, applied_at
        FROM applications
        WHERE candidate_id = $1
		ORDER BY applied_at
    `
	var applications []models.Application
	err := orm.DB.Select(&applications, query, candidateID)
	return applications, err
}

func GetApplicationsByJobID(jobID uuid.UUID) ([]models.Application, error) {
	query := `
        SELECT application_id, candidate_id, job_id, score, status, applied_at
        FROM applications
        WHERE job_id = $1
		ORDER BY score
    `
	var applications []models.Application
	err := orm.DB.Select(&applications, query, jobID)
	return applications, err
}

func DeleteApplicationByID(applicationID, candidateID uuid.UUID) error {
	var exists bool
	queryCheck := `
        SELECT EXISTS (
            SELECT 1 FROM applications
            WHERE application_id = $1 AND candidate_id = $2
        )
    `
	err := orm.DB.Get(&exists, queryCheck, applicationID, candidateID)
	if err != nil {
		log.Printf("Error checking application ownership: %v", err)
		return fmt.Errorf("could not verify application ownership: %w", err)
	}
	if !exists {
		return fmt.Errorf("unauthorized: candidate does not own this application or it does not exist")
	}

	queryDelete := `DELETE FROM applications WHERE application_id = $1`
	result, err := orm.DB.Exec(queryDelete, applicationID)
	if err != nil {
		log.Printf("Error deleting application: %v", err)
		return fmt.Errorf("could not delete application: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error checking rows affected: %v", err)
		return fmt.Errorf("could not verify application deletion: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("application not found or already deleted")
	}

	return nil
}

func GetApplicantPoolsByCompanyID(companyID uuid.UUID) ([]models.ApplicantPool, error) {
	jobIDs := []uuid.UUID{}
	err := orm.DB.Select(&jobIDs, `
        SELECT id FROM job_listings
        WHERE company_id = $1
    `, companyID)
	if err != nil {
		return nil, fmt.Errorf("error fetching job IDs: %w", err)
	}

	if len(jobIDs) == 0 {
		return []models.ApplicantPool{}, nil
	}

	uuidInterfaces := make([]interface{}, len(jobIDs))
	for i, id := range jobIDs {
		uuidInterfaces[i] = id
	}

	query, args, err := sqlx.In(`
		SELECT 
			a.application_id,
			a.candidate_id,
			a.job_id,
			a.status,
			a.applied_at,
			a.score,
			c.full_name AS candidate_name,
			c.skills AS candidate_skills
		FROM applications a
		JOIN candidates c ON a.candidate_id = c.id
		WHERE a.job_id IN (?)
	`, uuidInterfaces)
	if err != nil {
		return nil, fmt.Errorf("error building query: %w", err)
	}
	query = orm.DB.Rebind(query)

	var rawApps []models.ExtendedApplication
	err = orm.DB.Select(&rawApps, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error fetching applications with candidate info: %w", err)
	}

	poolMap := make(map[uuid.UUID][]models.AppWithCandidate)
	for _, extApp := range rawApps {
		app := models.AppWithCandidate{
			ApplicationID:   extApp.ApplicationID,
			CandidateID:     extApp.CandidateID,
			JobID:           extApp.JobID,
			Score:           extApp.Score,
			Status:          extApp.Status,
			AppliedAt:       extApp.AppliedAt,
			CandidateName:   extApp.CandidateName,
			CandidateSkills: extApp.CandidateSkills,
		}
		poolMap[extApp.JobID] = append(poolMap[extApp.JobID], app)
	}

	var pools []models.ApplicantPool
	for jobID, apps := range poolMap {
		pools = append(pools, models.ApplicantPool{
			JobID:        jobID,
			Applications: apps,
		})
	}

	return pools, nil
}
