package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Application struct {
	ApplicationID uuid.UUID `db:"application_id"`
	CandidateID   uuid.UUID `db:"candidate_id"`
	JobID         uuid.UUID `db:"job_id"`
	Score         int       `db:"score"`
	Status        string    `db:"status"`
	AppliedAt     time.Time `db:"applied_at"`
}

type ExtendedApplication struct {
	ApplicationID   uuid.UUID      `db:"application_id" json:"ApplicationID"`
	CandidateID     uuid.UUID      `db:"candidate_id" json:"CandidateID"`
	JobID           uuid.UUID      `db:"job_id" json:"JobID"`
	Score           int            `db:"score" json:"Score"`
	Status          string         `db:"status" json:"Status"`
	AppliedAt       time.Time      `db:"applied_at" json:"AppliedAt"`
	CandidateName   string         `db:"candidate_name" json:"CandidateName"`
	CandidateSkills pq.StringArray `db:"candidate_skills" json:"CandidateSkills"`
}

type AppWithCandidate struct {
	ApplicationID   uuid.UUID `json:"ApplicationID"`
	CandidateID     uuid.UUID `json:"CandidateID"`
	JobID           uuid.UUID `json:"JobID"`
	Score           int       `json:"Score"`
	Status          string    `json:"Status"`
	AppliedAt       time.Time `json:"AppliedAt"`
	CandidateName   string    `json:"CandidateName"`
	CandidateSkills []string  `json:"CandidateSkills"`
}

type ApplicantPool struct {
	JobID        uuid.UUID          `json:"JobID"`
	Applications []AppWithCandidate `json:"Applications"`
}
