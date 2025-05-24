        <Grid container spacing={3}>
          {recordTypes.map((recordType) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={recordType.id}>
              <Card 
                onClick={() => !recordType.disabled && onSelect(recordType.type)}
                sx={{
                  cursor: recordType.disabled ? 'not-allowed' : 'pointer',
                  height: '100%',
                  p: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: recordType.disabled ? 0.6 : 1,
                  '&:hover': {
                    transform: recordType.disabled ? 'none' : 'translateY(-4px)',
                    boxShadow: recordType.disabled ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
