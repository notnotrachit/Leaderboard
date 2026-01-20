package api

import (
	"net/http"
)

// NewHandlerWithMiddleware creates the router and wraps it with middleware
func NewHandlerWithMiddleware(h *Handler) http.Handler {
	mux := http.NewServeMux()

	// API Endpoints
	// Using Go 1.22+ method matching
	mux.HandleFunc("POST /api/seed", h.Seed)
	mux.HandleFunc("GET /api/leaderboard", h.GetLeaderboard)
	mux.HandleFunc("GET /api/user/{username}", h.GetUser)
	mux.HandleFunc("GET /api/search", h.Search) // Added search endpoint
	mux.HandleFunc("GET /api/stats", h.GetStats)
	mux.HandleFunc("POST /api/simulate", h.StartSimulation)

	// Wrap with Middleware: Logger(CORS(Mux))
	// CORS should be outer to handle OPTIONS requests before Logger or logic
	return Logger(CORSMiddleware(mux))
}
