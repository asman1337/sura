import { Injectable } from '@nestjs/common';
import { Officer } from '../../officers/entities/officer.entity';
import { MalkhanaService } from '../../malkhana/services/malkhana.service';
import { DutyRosterService } from '../../duty-roster/services/duty-roster.service';
import { RecordsService } from '../../records/services/records.service';

export interface DashboardStats {
  cases: number;
  evidence: number;
  tasks: number;
  reports: number;
}

export interface ActivityItem {
  id: string;
  time: string;
  description: string;
  user: string;
  type: 'case' | 'evidence' | 'duty' | 'report';
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly malkhanaService: MalkhanaService,
    private readonly dutyRosterService: DutyRosterService,
    private readonly recordsService: RecordsService,
  ) {}
  async getStats(officer: Officer): Promise<DashboardStats> {
    try {
      // Get counts from different modules
      const [evidenceCount, dutyCount, recordsCount] = await Promise.all([
        this.malkhanaService.getItemCount(officer.organizationId),
        this.dutyRosterService.getPendingDutiesCount(officer.organizationId),
        this.recordsService.getRecordsCount(officer.organizationId),
      ]);

      return {
        cases: recordsCount || 0,
        evidence: evidenceCount || 0,
        tasks: dutyCount || 0,
        reports: recordsCount || 0, // Using records count for reports as well
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if there's an error
      return {
        cases: 0,
        evidence: 0,
        tasks: 0,
        reports: 0,
      };
    }
  }
  async getRecentActivity(officer: Officer): Promise<ActivityItem[]> {
    try {
      const activities: ActivityItem[] = [];
      
      // Get recent evidence items
      const recentEvidence = await this.malkhanaService.getRecentItems(officer.organizationId, 3);
      recentEvidence.forEach(item => {
        activities.push({
          id: `evidence-${item.id}`,
          time: this.formatTime(item.createdAt),
          description: `New evidence item added: ${item.description || 'Unknown item'}`,
          user: item.createdBy || 'Unknown Officer',
          type: 'evidence'
        });
      });      // Get recent duty assignments
      const recentDuties = await this.dutyRosterService.getRecentDuties(officer.organizationId, 2);
      recentDuties.forEach(duty => {
        // Extract user name from Officer entity or use fallback
        const userName = duty.createdBy 
          ? (typeof duty.createdBy === 'string' 
             ? duty.createdBy 
             : `${duty.createdBy.firstName || ''} ${duty.createdBy.lastName || ''}`.trim() || duty.createdBy.id)
          : 'System';
          
        activities.push({
          id: `duty-${duty.id}`,
          time: this.formatTime(duty.createdAt),
          description: `Duty roster created: ${duty.name}`,
          user: userName,
          type: 'duty'
        });
      });

      // Sort by time (most recent first)
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      return activities.slice(0, 5); // Return top 5 activities
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  }
}
