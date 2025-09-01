package models

import "time"

// User merepresentasikan tabel users
type User struct {
	ID           int       `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"` // jangan tampilkan password
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}
