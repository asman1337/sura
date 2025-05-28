import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Typography,
  CircularProgress
} from '@mui/material';
import { useData } from '../../../../core/data/data-context';
import { DutyAssignmentRepository } from '../../repositories/duty-assignment-repository';
import { DutyAssignment } from '../../types';

const UpcomingDutiesWidget: React.FC = () => {
  const { api, cache, sync, storage } = useData();
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        
        const repository = new DutyAssignmentRepository(api, cache, sync, storage);
        // const today = new Date().toISOString().split('T')[0];
        
        // In a real implementation, we would filter by date range
        // For now, just get all assignments
        const allAssignments = await repository.getAll();
        
        // Sort by date
        const sortedAssignments = allAssignments.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        // Take the first 5
        setAssignments(sortedAssignments.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching upcoming duties:', err);
        setError('Failed to load upcoming duties');
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [api, cache, sync, storage]);

  return (
    <Card>
      <CardHeader title="Upcoming Duties" />
      <Divider />
      <CardContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : assignments.length === 0 ? (
          <Typography variant="body2">No upcoming duties found</Typography>
        ) : (
          <List>
            {assignments.map((assignment) => (
              <ListItem key={assignment.id} divider>
                <ListItemText
                  primary={`${assignment.date} - ${assignment.shift?.name || 'Unknown Shift'}`}
                  secondary={`Officer: ${assignment.officer?.firstName || 'Unknown Officer'}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDutiesWidget; 