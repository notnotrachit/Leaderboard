package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"goleaderboard/internal/leaderboard"
	"goleaderboard/internal/simulator"
)

type Handler struct {
	lb  *leaderboard.Leaderboard
	sim *simulator.Simulator
}

func NewHandler(lb *leaderboard.Leaderboard, sim *simulator.Simulator) *Handler {
	return &Handler{
		lb:  lb,
		sim: sim,
	}
}

// SeedRequest represents the seed endpoint body
type SeedRequest struct {
	Count         int  `json:"count"`
	ClearExisting bool `json:"clear_existing"`
}

// LeaderboardResponse represents paginated leaderboard
type LeaderboardResponse struct {
	Users      []leaderboard.RankedUser `json:"users"`
	Pagination PaginationInfo           `json:"pagination"`
}

type PaginationInfo struct {
	Offset  int  `json:"offset"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasMore bool `json:"has_more"`
}

// UserResponse represents single user lookup
type UserResponse struct {
	Username   string  `json:"username"`
	Rating     int     `json:"rating"`
	Rank       int     `json:"rank"`
	Percentile float64 `json:"percentile"`
}

// SimRequest for starting simulation
type SimRequest struct {
	UpdatesPerSecond int `json:"updates_per_second"`
	DurationSeconds  int `json:"duration_seconds"`
	RatingChangeMax  int `json:"rating_change_max"`
}

func (h *Handler) Seed(w http.ResponseWriter, r *http.Request) {
	var req SeedRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Count <= 0 {
		req.Count = 1000
	}

	start := time.Now()
	h.lb.Seed(req.Count, req.ClearExisting)
	duration := time.Since(start)

	stats := h.lb.GetStats()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"users_created": req.Count,
		"duration_ms":   duration.Milliseconds(),
		"stats":         stats,
	})
}

func (h *Handler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	users := h.lb.GetTopN(limit, offset)
	total := h.lb.Count()

	resp := LeaderboardResponse{
		Users: users,
		Pagination: PaginationInfo{
			Offset:  offset,
			Limit:   limit,
			Total:   total,
			HasMore: offset+len(users) < total,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	if username == "" {
		http.Error(w, "username is required", http.StatusBadRequest)
		return
	}

	ranked, err := h.lb.GetUserRank(username)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error":    err.Error(),
			"username": username,
		})
		return
	}

	total := h.lb.Count()
	percentile := 0.0
	if total > 0 {
		percentile = 100.0 * float64(total-ranked.Rank+1) / float64(total)
	}

	resp := UserResponse{
		Username:   ranked.Username,
		Rating:     ranked.Rating,
		Rank:       ranked.Rank,
		Percentile: percentile,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Search handles fuzzy user search
func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if len(query) < 2 {
		http.Error(w, "query must be at least 2 characters", http.StatusBadRequest)
		return
	}

	limit := 20
	results := h.lb.SearchUsers(query, limit)

	// Convert to response format
	// For search, we can reuse UserResponse or just return the RankedUser list
	// Let's return the RankedUser list directly as it matches the struct
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats := h.lb.GetStats()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (h *Handler) StartSimulation(w http.ResponseWriter, r *http.Request) {
	var req SimRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.UpdatesPerSecond <= 0 {
		req.UpdatesPerSecond = 10
	}
	if req.DurationSeconds <= 0 {
		req.DurationSeconds = 10
	}
	if req.RatingChangeMax <= 0 {
		req.RatingChangeMax = 50
	}

	cfg := simulator.Config{
		UpdatesPerSecond: req.UpdatesPerSecond,
		Duration:         time.Duration(req.DurationSeconds) * time.Second,
		RatingChangeMax:  req.RatingChangeMax,
	}

	msg := h.sim.Start(cfg)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": msg,
		"status":  "running",
	})
}
