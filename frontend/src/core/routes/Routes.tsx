import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/auth';
import { MainLayout } from '../components/layout';
import { 
  HomePage, 
  LoginPage, 
  DashboardPage,
  ProfilePage
} from '../pages';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <MainLayout>
          <HomePage />
        </MainLayout>
      } />
      
      <Route path="/login" element={
        <MainLayout>
          <LoginPage />
        </MainLayout>
      } />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </AuthGuard>
      } />

      <Route path="/profile" element={
        <AuthGuard>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </AuthGuard>
      } />
      
      {/* Fallback route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 