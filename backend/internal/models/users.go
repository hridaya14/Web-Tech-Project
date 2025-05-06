package models

import (
	"github.com/google/uuid"
	"time"
)

type User struct {
	ID               uuid.UUID `db:"id"`
	Username         string    `db:"username"`
	Email            string    `db:"email"`
	PasswordHash     string    `db:"password_hash"`
	CreatedAt        time.Time `db:"created_at"`
	Role             string    `db:"role"` // "candidate" or "company"
	OnboardingStatus string    `db:"onboarding_status" json:"onboarding_status"`
}

type AuthenticatedUser struct {
	ID       uuid.UUID
	Username string
}
