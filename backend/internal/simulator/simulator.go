package simulator

import (
	"math/rand"
	"time"

	"goleaderboard/internal/leaderboard"
)

type Config struct {
	UpdatesPerSecond int
	Duration         time.Duration
	RatingChangeMax  int
}

type Simulator struct {
	lb        *leaderboard.Leaderboard
	isRunning bool
	stopChan  chan struct{}
}

func NewSimulator(lb *leaderboard.Leaderboard) *Simulator {
	return &Simulator{
		lb:       lb,
		stopChan: make(chan struct{}),
	}
}

// Start begins a background simulation
func (s *Simulator) Start(cfg Config) string {
	if s.isRunning {
		return "Simulation already running"
	}

	s.isRunning = true
	s.stopChan = make(chan struct{})

	go s.runLoop(cfg)

	return "Simulation started"
}

func (s *Simulator) Stop() {
	if s.isRunning {
		close(s.stopChan)
		s.isRunning = false
	}
}

func (s *Simulator) IsRunning() bool {
	return s.isRunning
}

func (s *Simulator) runLoop(cfg Config) {
	defer func() {
		s.isRunning = false
	}()

	ticker := time.NewTicker(time.Second / time.Duration(cfg.UpdatesPerSecond))
	defer ticker.Stop()

	timeout := time.After(cfg.Duration)

	// Get a list of users to pick from randomly
	// In a real system we wouldn't fetch all, but for sim it's fine
	// or we just generate random user names if we know the pattern
	// Let's assume user_0 to user_N based on count, but simpler is to just
	// get top N and pick one, or just assume "user_xxxx" exists.
	// Actually, let's fetch a snapshot of usernames to update.
	// If the list is huge, this might be heavy, but let's try a lighter approach:
	// Just generate random usernames assuming the seed pattern "user_xxxxx"
	// However, to be safe, let's just pick from Top N to keep leaderboard active.

	// Better approach: Since we don't expose "GetAllUsernames", we rely on the seed pattern.
	// Seed uses "user_" + 8 random chars. That's hard to guess.
	// Let's add a method to Leaderboard to get random keys, or just maintain a cache here?
	// For this assignment, let's modify the Leaderboard to support "GetRandomUser" or just
	// grab the top 1000 and shuffle them around.

	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	for {
		select {
		case <-s.stopChan:
			return
		case <-timeout:
			return
		case <-ticker.C:
			// Pick a random user from the leaderboard
			// Since we don't have efficient random pick, let's cheat slightly:
			// We'll get the top 100 users and modify one of them
			// or we can store the known usernames in the simulator when seeding happens.
			// Ideally, we'd pass a list of target users.
			// For now, let's just use the fact that we can get Top N.

			// To make it interesting, we update top players more often (churn at the top)
			topUsers := s.lb.GetTopN(50, r.Intn(100)) // Get 50 users from random offset 0-100
			if len(topUsers) == 0 {
				continue
			}

			target := topUsers[r.Intn(len(topUsers))]

			// Random change
			delta := r.Intn(cfg.RatingChangeMax*2) - cfg.RatingChangeMax
			newRating := target.Rating + delta

			// Clamp
			if newRating < leaderboard.MinRating {
				newRating = leaderboard.MinRating
			}
			if newRating > leaderboard.MaxRating {
				newRating = leaderboard.MaxRating
			}

			s.lb.UpdateRating(target.Username, newRating)
		}
	}
}
