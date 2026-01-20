import axios from 'axios';
import { LeaderboardResponse, UserRankResponse, StatsResponse } from './types';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const leaderboardApi = {
  getLeaderboard: async (limit = 50, offset = 0): Promise<LeaderboardResponse> => {
    const { data } = await api.get('/leaderboard', { params: { limit, offset } });
    return data;
  },

  getUserRank: async (username: string): Promise<UserRankResponse> => {
    const { data } = await api.get(`/user/${encodeURIComponent(username)}`);
    return data;
  },

  searchUsers: async (query: string): Promise<UserRankResponse[]> => {
    const { data } = await api.get('/search', { params: { q: query } });
    return data;
  },

  seed: async (count = 10000): Promise<void> => {
    await api.post('/seed', { count, clear_existing: true });
  },

  getStats: async (): Promise<StatsResponse> => {
    const { data } = await api.get('/stats');
    return data;
  },

  startSimulation: async (updatesPerSecond = 100, duration = 30): Promise<void> => {
    await api.post('/simulate', {
      updates_per_second: updatesPerSecond,
      duration_seconds: duration,
    });
  },
};
