import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';

import FarmerDashboard from './pages/FarmerDashboard';
import FarmerProfile from './pages/FarmerProfile';
import AiQuery from './pages/AiQuery';
import DiseaseDetection from './pages/DiseaseDetection';
import Weather from './pages/Weather';
import Recommendation from './pages/Recommendation';
import Market from './pages/Market';
import Schemes from './pages/Schemes';
import ExpertAsk from './pages/ExpertAsk';
import Notifications from './pages/Notifications';

import ExpertDashboard from './pages/ExpertDashboard';
import ExpertQueries from './pages/ExpertQueries';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminExperts from './pages/AdminExperts';
import AdminFeedback from './pages/AdminFeedback';

function withLayout(element) {
  return <Layout>{element}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/farmer" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<FarmerDashboard />)}</ProtectedRoute>} />
          <Route path="/farmer/profile" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<FarmerProfile />)}</ProtectedRoute>} />
          <Route path="/farmer/ai-query" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<AiQuery />)}</ProtectedRoute>} />
          <Route path="/farmer/disease" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<DiseaseDetection />)}</ProtectedRoute>} />
          <Route path="/farmer/weather" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<Weather />)}</ProtectedRoute>} />
          <Route path="/farmer/recommendation" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<Recommendation />)}</ProtectedRoute>} />
          <Route path="/farmer/market" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<Market />)}</ProtectedRoute>} />
          <Route path="/farmer/schemes" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<Schemes />)}</ProtectedRoute>} />
          <Route path="/farmer/expert" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<ExpertAsk />)}</ProtectedRoute>} />
          <Route path="/farmer/notifications" element={<ProtectedRoute allowedRoles={['FARMER', 'STUDENT']}>{withLayout(<Notifications />)}</ProtectedRoute>} />

          <Route path="/expert" element={<ProtectedRoute allowedRoles={['EXPERT']}>{withLayout(<ExpertDashboard />)}</ProtectedRoute>} />
          <Route path="/expert/queries" element={<ProtectedRoute allowedRoles={['EXPERT']}>{withLayout(<ExpertQueries />)}</ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}>{withLayout(<AdminDashboard />)}</ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}>{withLayout(<AdminUsers />)}</ProtectedRoute>} />
          <Route path="/admin/experts" element={<ProtectedRoute allowedRoles={['ADMIN']}>{withLayout(<AdminExperts />)}</ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['ADMIN']}>{withLayout(<AdminFeedback />)}</ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
