package database

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/orm"
)

// CreateUser inserts a new user into the database
func CreateUser(user *models.User) error {
	query := `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `
	_, err := orm.DB.Exec(query, user.Username, user.Email, user.PasswordHash, user.Role)

	return err
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
