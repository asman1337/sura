import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { usePlugins } from '../../../core/plugins';
import { useData } from '../../../core/data/data-context';

interface ExtensionPointInfo {
  name: string;
  count: number;
}

const DebugInfo: React.FC = () => {
  const plugins = usePlugins();
  const dataContext = useData();
  const [pluginInfo, setPluginInfo] = useState<any>(null);
  const [extensionPoints, setExtensionPoints] = useState<ExtensionPointInfo[]>([]);
  const [dataServiceInfo, setDataServiceInfo] = useState<string[]>([]);
  
  useEffect(() => {
    // Get plugin info
    const dutyRosterPlugin = plugins.getPlugin('sura-duty-roster-plugin');
    
    if (dutyRosterPlugin) {
      setPluginInfo({
        id: dutyRosterPlugin.id,
        isActive: true,
        manifest: dutyRosterPlugin.manifest
      });
      
      // Check repositories
      const rosterRepositoryExt = dutyRosterPlugin.getExtensionPoints('duty-roster:rosterRepository');
      const shiftRepositoryExt = dutyRosterPlugin.getExtensionPoints('duty-roster:shiftRepository');
      const assignmentRepositoryExt = dutyRosterPlugin.getExtensionPoints('duty-roster:assignmentRepository');
      
      setExtensionPoints([
        { name: 'duty-roster:rosterRepository', count: rosterRepositoryExt?.length || 0 },
        { name: 'duty-roster:shiftRepository', count: shiftRepositoryExt?.length || 0 },
        { name: 'duty-roster:assignmentRepository', count: assignmentRepositoryExt?.length || 0 }
      ]);
    }
    
    // Check data services
    if (dataContext) {
      setDataServiceInfo(Object.keys(dataContext));
    }
  }, [plugins, dataContext]);
  
  const forceTriggerInitialization = () => {
    const dutyRosterPlugin = plugins.getPlugin('sura-duty-roster-plugin');
    
    if (dutyRosterPlugin) {
      // Manually try to initialize services
      import('../services').then(services => {
        console.log('Manually initializing services');
        services.default.initialize(dutyRosterPlugin);
        
        // Refresh extension points
        setTimeout(() => {
          const rosterRepositoryExt = dutyRosterPlugin.getExtensionPoints('duty-roster:rosterRepository');
          const shiftRepositoryExt = dutyRosterPlugin.getExtensionPoints('duty-roster:shiftRepository');
          const assignmentRepositoryExt = dutyRosterPlugin.getExtensionPoints('duty-roster:assignmentRepository');
          
          setExtensionPoints([
            { name: 'duty-roster:rosterRepository', count: rosterRepositoryExt?.length || 0 },
            { name: 'duty-roster:shiftRepository', count: shiftRepositoryExt?.length || 0 },
            { name: 'duty-roster:assignmentRepository', count: assignmentRepositoryExt?.length || 0 }
          ]);
        }, 500);
      });
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Plugin Debug Information</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Duty Roster Plugin</Typography>
        {!pluginInfo ? (
          <Typography color="error">Plugin not found</Typography>
        ) : (
          <Box>
            <Typography><strong>ID:</strong> {pluginInfo.id}</Typography>
            <Typography><strong>Active:</strong> {pluginInfo.isActive ? 'Yes' : 'No'}</Typography>
            <Typography><strong>Name:</strong> {pluginInfo.manifest?.name}</Typography>
            <Typography><strong>Version:</strong> {pluginInfo.manifest?.version}</Typography>
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Extension Points</Typography>
        {extensionPoints.length === 0 ? (
          <Typography>No extension points found</Typography>
        ) : (
          <Box>
            {extensionPoints.map(ext => (
              <Typography key={ext.name}>
                <strong>{ext.name}:</strong> {ext.count} extensions
              </Typography>
            ))}
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Data Services</Typography>
        {dataServiceInfo.length === 0 ? (
          <Typography>No data services found</Typography>
        ) : (
          <Box>
            {dataServiceInfo.map(service => (
              <Typography key={service}>{service}</Typography>
            ))}
          </Box>
        )}
      </Paper>
      
      <Button variant="contained" color="primary" onClick={forceTriggerInitialization}>
        Force Trigger Initialization
      </Button>
    </Box>
  );
};

export default DebugInfo; 