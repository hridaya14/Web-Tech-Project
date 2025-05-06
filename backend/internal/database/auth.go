package database

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/orm"
	"log"
)

// CreateUser inserts a new user into the database
func CreateUser(user *models.User) (uuid.UUID, error) {
	query := `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `
	var id uuid.UUID
	err := orm.DB.Get(&id, query, user.Username, user.Email, user.PasswordHash, user.Role)

	if err != nil {
		return uuid.Nil, err
	}

	return id, nil
}

func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	query := `SELECT * FROM users WHERE email = $1`
	err := orm.DB.Get(&user, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err // actual DB error
	}
	return &user, nil
}

// CheckUserExists checks if a user with the given email already exists
func CheckUserExists(email string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)`
	err := orm.DB.Get(&exists, query, email)
	return exists, err
}

func GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	query := "SELECT username, email, role, onboarding_status FROM users WHERE username = $1"
	err := orm.DB.Get(&user, query, username)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func UpdateOnboardingStatus(userID uuid.UUID, newStatus string) error {
	query := `
		UPDATE users 
		SET onboarding_status = $1 
		WHERE id = $2
	`

	result, err := orm.DB.Exec(query, newStatus, userID)
	if err != nil {
		return fmt.Errorf("failed to update onboarding status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no user found with ID %d", userID)
	}

	return nil
}

func GetUserRelatedID(userID uuid.UUID) (any, error) {
	var role string

	query := "SELECT role FROM users WHERE id = $1"
	err := orm.DB.Get(&role, query, userID)
	if err != nil {
		log.Printf("Error fetching user role: %v", err)
		return nil, fmt.Errorf("could not fetch user role: %w", err)
	}

	if role == "candidate" {
		var jobSeekerID uuid.UUID
		query = "SELECT id FROM candidates WHERE user_id = $1"
		err := orm.DB.Get(&jobSeekerID, query, userID)
		if err != nil {
			log.Printf("Error fetching job seeker ID: %v", err)
			return nil, fmt.Errorf("could not fetch job seeker ID: %w", err)
		}
		return jobSeekerID, nil
	} else if role == "company" {
		var companyID uuid.UUID
		query = "SELECT id FROM companies WHERE user_id = $1"
		err := orm.DB.Get(&companyID, query, userID)
		if err != nil {
			log.Printf("Error fetching company ID: %v", err)
			return nil, fmt.Errorf("could not fetch company ID: %w", err)
		}
		return companyID, nil
	}

	return nil, fmt.Errorf("unknown role: %s", role)
}
