package leaderboard

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	_ "github.com/lib/pq"
)

var (
	ErrUserNotFound  = errors.New("user not found")
	ErrUserExists    = errors.New("user already exists")
	ErrInvalidRating = errors.New("rating must be between 100 and 5000")
)

// Leaderboard manages users in Postgres
type Leaderboard struct {
	db *sql.DB
}

// NewLeaderboard connects to Postgres and ensures schema exists
func NewLeaderboard(dsn string) (*Leaderboard, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	// OPTIMIZATION: Tune Connection Pool
	// SetMaxOpenConns: Max concurrent connections to the DB.
	// 25 is a good starting point for Azure/Cloud Postgres small instances.
	db.SetMaxOpenConns(25)
	// SetMaxIdleConns: Keep these ready to avoid handshake latency.
	db.SetMaxIdleConns(25)
	// SetConnMaxLifetime: Recycle connections to prevent stale timeouts.
	db.SetConnMaxLifetime(5 * time.Minute)

	lb := &Leaderboard{db: db}
	if err := lb.initSchema(); err != nil {
		return nil, err
	}

	return lb, nil
}

func (lb *Leaderboard) initSchema() error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		username VARCHAR(255) PRIMARY KEY,
		rating INTEGER NOT NULL CHECK (rating >= 100 AND rating <= 5000),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_rating ON users(rating DESC);
	-- OPTIMIZATION: Index for fast case-insensitive prefix search
	CREATE INDEX IF NOT EXISTS idx_username_lower ON users(lower(username) varchar_pattern_ops);
	`
	_, err := lb.db.Exec(query)
	return err
}

func (lb *Leaderboard) AddUser(username string, rating int) error {
	if rating < MinRating || rating > MaxRating {
		return ErrInvalidRating
	}

	_, err := lb.db.Exec("INSERT INTO users (username, rating) VALUES ($1, $2)", username, rating)
	if err != nil {
		// Simple check for duplicate key error
		return ErrUserExists
	}
	return nil
}

func (lb *Leaderboard) UpdateRating(username string, newRating int) error {
	if newRating < MinRating || newRating > MaxRating {
		return ErrInvalidRating
	}

	res, err := lb.db.Exec("UPDATE users SET rating = $1 WHERE username = $2", newRating, username)
	if err != nil {
		return err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (lb *Leaderboard) GetUserRank(username string) (*RankedUser, error) {
	var u User
	err := lb.db.QueryRow("SELECT username, rating FROM users WHERE username = $1", username).Scan(&u.Username, &u.Rating)
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	} else if err != nil {
		return nil, err
	}

	// Calculate rank: 1 + count of users with rating > u.Rating
	var rank int
	err = lb.db.QueryRow("SELECT COUNT(*) + 1 FROM users WHERE rating > $1", u.Rating).Scan(&rank)
	if err != nil {
		return nil, err
	}

	return &RankedUser{
		User: u,
		Rank: rank,
	}, nil
}

func (lb *Leaderboard) SearchUsers(query string, limit int) []RankedUser {
	// Search by prefix
	rows, err := lb.db.Query(`
		SELECT username, rating,
		(SELECT COUNT(*) + 1 FROM users u2 WHERE u2.rating > users.rating) as rank
		FROM users
		WHERE username ILIKE $1 || '%'
		ORDER BY rank ASC, username ASC
		LIMIT $2`, query, limit)

	if err != nil {
		log.Println("Search error:", err)
		return []RankedUser{}
	}
	defer rows.Close()

	var results []RankedUser
	for rows.Next() {
		var r RankedUser
		if err := rows.Scan(&r.Username, &r.Rating, &r.Rank); err != nil {
			continue
		}
		results = append(results, r)
	}
	return results
}

func (lb *Leaderboard) GetTopN(limit, offset int) []RankedUser {
	// Use window function for efficient ranking in one query
	// RANK() gives standard competition ranking (1, 1, 3) which matches "count > rating + 1" logic
	query := `
		SELECT username, rating, rank FROM (
			SELECT username, rating,
			RANK() OVER (ORDER BY rating DESC) as rank
			FROM users
		) sub
		ORDER BY rank ASC, username ASC
		LIMIT $1 OFFSET $2
	`

	rows, err := lb.db.Query(query, limit, offset)
	if err != nil {
		log.Println("TopN error:", err)
		return []RankedUser{}
	}
	defer rows.Close()

	var results []RankedUser
	for rows.Next() {
		var r RankedUser
		if err := rows.Scan(&r.Username, &r.Rating, &r.Rank); err != nil {
			continue
		}
		results = append(results, r)
	}
	return results
}

func (lb *Leaderboard) GetStats() LeaderboardStats {
	var stats LeaderboardStats

	lb.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&stats.TotalUsers)
	lb.db.QueryRow("SELECT COUNT(DISTINCT rating) FROM users").Scan(&stats.UniqueRatings)
	lb.db.QueryRow("SELECT COALESCE(MAX(rating), 0) FROM users").Scan(&stats.HighestRating)
	lb.db.QueryRow("SELECT COALESCE(MIN(rating), 0) FROM users").Scan(&stats.LowestRating)

	return stats
}

func (lb *Leaderboard) Count() int {
	var count int
	lb.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	return count
}

func (lb *Leaderboard) Seed(count int, clear bool) {
	if clear {
		lb.db.Exec("TRUNCATE TABLE users")
	}

	gofakeit.Seed(time.Now().UnixNano())

	// Batch insert logic
	batchSize := 500
	for i := 0; i < count; i += batchSize {
		end := i + batchSize
		if end > count {
			end = count
		}

		tx, err := lb.db.Begin()
		if err != nil {
			log.Printf("Seed batch tx error at %d: %v", i, err)
			return
		}

		stmt, err := tx.Prepare("INSERT INTO users (username, rating) VALUES ($1, $2) ON CONFLICT DO NOTHING")
		if err != nil {
			log.Printf("Seed batch prep error at %d: %v", i, err)
			tx.Rollback()
			return
		}

		for j := i; j < end; j++ {
			username := gofakeit.Username()
			username = fmt.Sprintf("%s_%d", username, gofakeit.Number(1, 99999))
			rating := gofakeit.Number(MinRating, MaxRating)

			if _, err := stmt.Exec(username, rating); err != nil {
				continue
			}
		}

		stmt.Close()
		if err := tx.Commit(); err != nil {
			log.Printf("Seed batch commit error at %d: %v", i, err)
		} else {
			// Log progress every 1000 users or so
			if (i+batchSize)%1000 == 0 || end == count {
				log.Printf("Seeded %d/%d users...", end, count)
			}
		}
	}
}

// Close closes the db connection
func (lb *Leaderboard) Close() error {
	return lb.db.Close()
}
