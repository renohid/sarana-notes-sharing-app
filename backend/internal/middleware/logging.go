package middleware

import (
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

func Logging(db *sqlx.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		// capture request headers (as map)
		hdr := map[string]string{}
		c.Request().Header.VisitAll(func(k, v []byte) {
			key := string(k)
			val := string(v)
			if key == "Authorization" && len(val) > 6 {
				val = val[:6] + "***masked***"
			}
			hdr[key] = val
		})

		// capture request payload (best-effort JSON)
		var payload any
		if len(c.Body()) > 0 {
			_ = json.Unmarshal(c.Body(), &payload)
		}

		// proceed
		err := c.Next()
		if err != nil {
			// let Fiber default error handler set the status & body
			_ = c.App().ErrorHandler(c, err)
		}

		// response body (try json)
		var resp any
		_ = json.Unmarshal(c.Response().Body(), &resp)

		_, _ = db.Exec(`
			INSERT INTO logs(at, method, endpoint, request_headers, request_payload, response_body, status_code)
			VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7)
		`,
			start, c.Method(), c.OriginalURL(),
			toJSON(hdr), toJSON(payload), toJSON(resp),
			c.Response().StatusCode(),
		)
		return nil
	}
}

func toJSON(v any) []byte {
	b, _ := json.Marshal(v)
	return b
}
