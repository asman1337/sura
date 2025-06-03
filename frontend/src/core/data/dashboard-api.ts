import { ApiClient } from './api-client';

export interface DashboardStats {
  cases: number;
  evidence: number;
  tasks: number;
  reports: number;
}

export interface ActivityItem {
  id: string;
  type: 'malkhana' | 'duty-roster' | 'record';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}

export class DashboardApi {
  private readonly baseUrl = '/dashboard';
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async getStats(): Promise<DashboardStats> {
    try {
      const response = await this.client.get<DashboardStats>(`${this.baseUrl}/stats`);
      return response;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return fallback data
      return {
        cases: 0,
        evidence: 0,
        tasks: 0,
        reports: 0,
      };
    }
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    try {
      const response = await this.client.get<ActivityItem[]>(`${this.baseUrl}/recent-activity`);
      return response;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async getDashboardData(): Promise<DashboardResponse> {
    try {
      const [stats, recentActivity] = await Promise.all([
        this.getStats(),
        this.getRecentActivity(),
      ]);

      return {
        stats,
        recentActivity,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Return fallback data
      return {
        stats: {
          cases: 0,
          evidence: 0,
          tasks: 0,
          reports: 0,
        },
        recentActivity: [],
      };
    }
  }
}
