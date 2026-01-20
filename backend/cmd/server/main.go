package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"goleaderboard/internal/api"
	"goleaderboard/internal/leaderboard"
	"goleaderboard/internal/simulator"
)

func main() {
	log.Println("Starting Scalable Leaderboard System...")

	// 1. Initialize Leaderboard with Postgres
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	lb, err := leaderboard.NewLeaderboard(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer lb.Close()

	// Seed initial data if requested via env or just empty start
	// For dev, let's seed 1000 users to start with if empty
	if lb.Count() == 0 {
		log.Println("Seeding initial 10,000 users...")
		lb.Seed(10000, true)
		log.Printf("Seeding complete. Total users: %d", lb.Count())
	}

	// 2. Initialize Simulator
	sim := simulator.NewSimulator(lb)

	// 3. Initialize API Handler
	handler := api.NewHandler(lb, sim)
	router := api.NewHandlerWithMiddleware(handler)

	// 4. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Server listening on port %s", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
