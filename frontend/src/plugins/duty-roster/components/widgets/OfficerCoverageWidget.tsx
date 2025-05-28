import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Typography,
  LinearProgress,
  Box,
  CircularProgress
} from '@mui/material';
import { useData } from '../../../../core/data/data-context';

interface CoverageData {
  dayName: string;
  morning: number;
  dayShift: number;
  night: number;
  total: number;
}

const OfficerCoverageWidget: React.FC = () => {
  const { api, cache, sync, storage } = useData();
  const [coverageData, setCoverageData] = useState<CoverageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoverageData = async () => {
      try {
        setLoading(true);
        
        // const repository = new DutyAssignmentRepository(api, cache, sync, storage);
        
        // In a real implementation, we would calculate coverage
        // For now, just set placeholder data
        const dummyData: CoverageData[] = [
          { dayName: 'Monday', morning: 80, dayShift: 90, night: 70, total: 85 },
          { dayName: 'Tuesday', morning: 85, dayShift: 88, night: 75, total: 83 },
          { dayName: 'Wednesday', morning: 82, dayShift: 92, night: 78, total: 84 },
          { dayName: 'Thursday', morning: 79, dayShift: 95, night: 68, total: 81 },
          { dayName: 'Friday', morning: 90, dayShift: 98, night: 85, total: 91 },
          { dayName: 'Saturday', morning: 60, dayShift: 70, night: 90, total: 73 },
          { dayName: 'Sunday', morning: 65, dayShift: 60, night: 80, total: 68 },
        ];
        
        setCoverageData(dummyData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching coverage data:', err);
        setError('Failed to load coverage data');
        setLoading(false);
      }
    };

    fetchCoverageData();
  }, [api, cache, sync, storage]);

  return (
    <Card>
      <CardHeader title="Officer Coverage" />
      <Divider />
      <CardContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : coverageData.length === 0 ? (
          <Typography variant="body2">No coverage data available</Typography>
        ) : (
          <div>
            {coverageData.map((day) => (
              <Box key={day.dayName} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{day.dayName}</Typography>
                  <Typography variant="body2">{day.total}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={day.total}
                  color={day.total > 80 ? 'success' : day.total > 60 ? 'warning' : 'error'}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
            ))}
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              Coverage is calculated based on assigned officers vs. required minimum staffing
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfficerCoverageWidget; 