export interface User {
  username: string;
  rating: number;
  rank: number;
}

export interface LeaderboardResponse {
  users: User[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface UserRankResponse {
  username: string;
  rating: number;
  rank: number;
  percentile: number;
}

export interface StatsResponse {
  total_users: number;
  unique_ratings: number;
  highest_rating: number;
  lowest_rating: number;
}
