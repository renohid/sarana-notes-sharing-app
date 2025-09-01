package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

type NotesHandler struct{ DB *sqlx.DB }

// POST /notes  (JWT required)
// Form fields: title (wajib), content (opsional), image (opsional file)
func (h NotesHandler) Create(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int)

	title := c.FormValue("title")
	content := c.FormValue("content")
	if title == "" {
		return fiber.NewError(fiber.StatusBadRequest, "title required")
	}

	var imageURL *string
	if file, err := c.FormFile("image"); err == nil && file != nil {
		dir := os.Getenv("UPLOAD_DIR")
		if dir == "" {
			dir = "./uploads"
		}
		_ = os.MkdirAll(dir, 0755)

		name := fmt.Sprintf("%d_%d_%s", userID, time.Now().Unix(), file.Filename)
		path := filepath.Join(dir, name)
		if err := c.SaveFile(file, path); err == nil {
			u := "/uploads/" + name
			imageURL = &u
		}
	}

	var id int
	err := h.DB.QueryRow(
		`INSERT INTO notes(user_id,title,content,image_url) VALUES($1,$2,$3,$4) RETURNING id`,
		userID, title, nullable(content), imageURL,
	).Scan(&id)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"id": id})
}

// GET /notes
func (h NotesHandler) List(c *fiber.Ctx) error {
	type item struct {
		ID       int     `db:"id" json:"id"`
		Title    string  `db:"title" json:"title"`
		ImageURL *string `db:"image_url" json:"image_url,omitempty"`
	}
	notes := []item{} // inisialisasi slice kosong → json jadi []

	if err := h.DB.Select(&notes, `SELECT id,title,image_url FROM notes ORDER BY id DESC`); err != nil {
		return fiber.ErrInternalServerError
	}
	return c.JSON(notes)
}

// GET /notes/:id
func (h NotesHandler) Detail(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var note struct {
		ID       int     `db:"id" json:"id"`
		Title    string  `db:"title" json:"title"`
		Content  *string `db:"content" json:"content,omitempty"`
		ImageURL *string `db:"image_url" json:"image_url,omitempty"`
	}
	if err := h.DB.Get(&note, `SELECT id,title,content,image_url FROM notes WHERE id=$1`, id); err != nil {
		return fiber.ErrNotFound
	}
	return c.JSON(note)
}

// DELETE /notes/:id  (JWT required, hanya pemilik)
func (h NotesHandler) Delete(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int)
	id, _ := strconv.Atoi(c.Params("id"))

	var owner int
	if err := h.DB.Get(&owner, `SELECT user_id FROM notes WHERE id=$1`, id); err != nil {
		return fiber.ErrNotFound
	}
	if owner != userID {
		return fiber.ErrForbidden
	}
	_, _ = h.DB.Exec(`DELETE FROM notes WHERE id=$1`, id)
	return c.JSON(fiber.Map{"deleted": id})
}

func nullable(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
