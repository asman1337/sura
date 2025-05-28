# Duty Roster UI Redesign Plan

This document outlines the plan for redesigning the Duty Roster plugin UI to match the Malkhana design pattern.

## Design Principles

1. **Centralized Navigation** - The dashboard serves as the central hub for navigation
2. **Card-Based UI** - Use MUI cards for consistent visual components
3. **Consistent Styling** - Follow the Malkhana styling patterns for consistency
4. **MUI 7+ Compatibility** - Use the updated MUI 7+ Grid component with size prop as an object

## Components to Update

### 1. RosterList Component

- Convert to card-based layout
- Add statistics header
- Add action buttons in the same style as Malkhana
- Implement consistent loading states and error handling

### 2. RosterDetail Component

- Add breadcrumb navigation
- Use card layout for roster details
- Add calendar/grid view of assignments
- Add consistent action buttons for editing/publishing

### 3. RosterForm Component

- Use card layout with sections
- Implement consistent form styling
- Add validation and error handling similar to Malkhana
- Add navigation back to dashboard

### 4. ShiftManagement Component

- Convert to card-based layout
- Add statistics for shifts
- Use consistent action buttons and tables

### 5. AssignmentCalendar Component

- Use card layout for the calendar container
- Implement consistent styling for calendar events
- Add quick filters and controls

### 6. OfficerDutyView Component

- Add officer details card
- Implement calendar view of officer's assignments
- Add filters and export functionality

## Shared Components to Create

1. **PageContainer** - Common wrapper for all pages
2. **DataTable** - Consistent table component for lists
3. **ActionCard** - Reusable action card component
4. **StatusChip** - Consistent status indicators

## Implementation Priority

1. Update RosterList component (most visible after dashboard)
2. Update RosterDetail component (core functionality)
3. Update RosterForm component (critical for creating new rosters)
4. Update ShiftManagement component
5. Update AssignmentCalendar component
6. Update OfficerDutyView component

## Design Resources

- Use Material UI theme colors for consistency
- Follow the alpha transparency pattern for background colors
- Use consistent spacing and typography

## Missing Features to Implement

1. QR code generation for duty assignments
2. Print functionality for rosters
3. Staff reports and analytics
4. Mobile-responsive design improvements

This plan will ensure a consistent, user-friendly interface across the entire Duty Roster plugin that aligns with the Malkhana design pattern. 