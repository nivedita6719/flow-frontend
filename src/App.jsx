
import React from 'react';

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';

// New imports
import WorkflowDetailPage from './pages/WorkflowDetailPage';
import RunDetailPage from './pages/RunDetailPage';

// Protected route — redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {

    const { isAuthenticated, loading } = useAuth();

    if (loading) {

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    fontSize: '16px',
                    color: '#64748b'
                }}
            >
                Loading...
            </div>
        );
    }

    return isAuthenticated()
        ? children
        : <Navigate to="/login" />;
};

// Public route — redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {

    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null;
    }

    return isAuthenticated()
        ? <Navigate to="/dashboard" />
        : children;
};

const AppRoutes = () => {

    return (
        <Routes>

            {/* Default route */}
            <Route
                path="/"
                element={<Navigate to="/dashboard" />}
            />

            {/* Public routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />

            {/* Protected routes */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            {/* Create workflow */}
            <Route
                path="/workflows/new"
                element={
                    <ProtectedRoute>
                        <WorkflowBuilderPage />
                    </ProtectedRoute>
                }
            />

            {/* Workflow details */}
            <Route
                path="/workflows/:id"
                element={
                    <ProtectedRoute>
                        <WorkflowDetailPage />
                    </ProtectedRoute>
                }
            />

            {/* Run details */}
            <Route
                path="/runs/:runId"
                element={
                    <ProtectedRoute>
                        <RunDetailPage />
                    </ProtectedRoute>
                }
            />

            {/* Catch all */}
            <Route
                path="*"
                element={<Navigate to="/dashboard" />}
            />

        </Routes>
    );
};

const App = () => {

    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;