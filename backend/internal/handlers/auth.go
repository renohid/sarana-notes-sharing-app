package handlers

import (
	"database/sql"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"

	"backend/internal/auth"
	"backend/internal/models"
)

type AuthHandler struct{ DB *sqlx.DB }

type creds struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h AuthHandler) Register(c *fiber.Ctx) error {
	var req creds
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}
	req.Email = strings.TrimSpace(req.Email)
	if req.Email == "" || len(req.Password) < 6 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid email/password")
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	_, err := h.DB.Exec(`INSERT INTO users(email, password_hash) VALUES($1,$2)`, req.Email, string(hash))
	if err != nil {
		return fiber.NewError(fiber.StatusConflict, "email already exists")
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "registered"})
}

func (h AuthHandler) Login(c *fiber.Ctx) error {
	var req creds
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}

	var u models.User
	err := h.DB.Get(&u, `SELECT * FROM users WHERE email=$1`, req.Email)
	if err == sql.ErrNoRows {
		return fiber.ErrUnauthorized
	}
	if err != nil {
		return fiber.ErrInternalServerError
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)) != nil {
		return fiber.ErrUnauthorized
	}

	token, _ := auth.GenerateToken(u.ID)
	return c.JSON(fiber.Map{"token": token})
}
