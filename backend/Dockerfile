# ---------- build stage (Go 1.25) ----------
FROM golang:1.25-alpine AS build
WORKDIR /src

# download deps
COPY go.mod go.sum ./
RUN go mod download

# copy source & build static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/api ./cmd/api

# ---------- final stage (distroless, tanpa shell) ----------
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
ENV UPLOAD_DIR=/app/uploads
VOLUME ["/app/uploads"]  # persist uploads
COPY --from=build /bin/api /app/api
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/app/api"]
