package auth

import (
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID int) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func RequireAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authz := c.Get("Authorization")
		if authz == "" {
			return fiber.ErrUnauthorized
		}
		var tokenStr string
		_, _ = fmt.Sscanf(authz, "Bearer %s", &tokenStr)
		if tokenStr == "" {
			return fiber.ErrUnauthorized
		}

		secret := os.Getenv("JWT_SECRET")
		tkn, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(secret), nil
		})
		if err != nil || !tkn.Valid {
			return fiber.ErrUnauthorized
		}

		claims, _ := tkn.Claims.(jwt.MapClaims)
		c.Locals("userID", int(claims["sub"].(float64)))
		return c.Next()
	}
}
