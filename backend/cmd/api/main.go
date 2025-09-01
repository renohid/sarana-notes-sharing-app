package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jmoiron/sqlx"

	"backend/internal/auth"
	"backend/internal/db"
	"backend/internal/handlers"
	"backend/internal/middleware"
)

func migrate(d *sqlx.DB) {
	d.MustExec(`CREATE TABLE IF NOT EXISTS users(
		id SERIAL PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		created_at TIMESTAMPTZ DEFAULT NOW()
	)`)

	d.MustExec(`CREATE TABLE IF NOT EXISTS notes(
		id SERIAL PRIMARY KEY,
		user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		content TEXT,
		image_url TEXT,
		created_at TIMESTAMPTZ DEFAULT NOW()
	)`)

	d.MustExec(`CREATE TABLE IF NOT EXISTS logs(
		id BIGSERIAL PRIMARY KEY,
		at TIMESTAMPTZ NOT NULL,
		method TEXT,
		endpoint TEXT,
		request_headers JSONB,
		request_payload JSONB,
		response_body JSONB,
		status_code INT
	)`)
}

func main() {
	d, err := db.Connect()
	if err != nil {
		log.Fatal(err)
	}
	migrate(d)

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))
	app.Use(middleware.Logging(d))

	// serve uploaded images
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	_ = os.MkdirAll(uploadDir, 0755)
	app.Static("/uploads", uploadDir)

	authH := handlers.AuthHandler{DB: d}
	notesH := handlers.NotesHandler{DB: d}

	// auth
	app.Post("/register", authH.Register)
	app.Post("/login", authH.Login)

	// notes
	app.Post("/notes", auth.RequireAuth(), notesH.Create) // protected
	app.Get("/notes", notesH.List)
	app.Get("/notes/:id", notesH.Detail)
	app.Delete("/notes/:id", auth.RequireAuth(), notesH.Delete) // owner only

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
