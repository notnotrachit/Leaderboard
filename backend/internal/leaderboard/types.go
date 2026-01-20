package leaderboard

const (
	MinRating    = 100
	MaxRating    = 5000
	RatingRange  = MaxRating - MinRating + 1 // 4901
)

// User represents a player in the leaderboard
type User struct {
	Username string `json:"username"`
	Rating   int    `json:"rating"`
	// Optional metadata could go here
}

// RankedUser includes computed rank for API responses
type RankedUser struct {
	User
	Rank int `json:"rank"`
}

// LeaderboardStats for monitoring
type LeaderboardStats struct {
	TotalUsers    int `json:"total_users"`
	UniqueRatings int `json:"unique_ratings"`
	HighestRating int `json:"highest_rating"`
	LowestRating  int `json:"lowest_rating"`
}
