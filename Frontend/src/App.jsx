import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from './api/userApi.js';
import { setCredentials, logout } from './store/authSlice.js';
import { useAuth } from './hooks/useAuth.js';

import Layout from './components/Layout.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import Loader from './components/Loader.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import CreatePostPage from './pages/CreatePostPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/feed' : '/login'} replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [hydrating, setHydrating] = useState(true);

  // On mount: try to rehydrate user from stored token
  useEffect(() => {
    const rehydrate = async () => {
      if (!accessToken) {
        setHydrating(false);
        return;
      }
      try {
        const res = await getCurrentUser();
        dispatch(setCredentials({ user: res.data.data }));
      } catch {
        dispatch(logout());
      } finally {
        setHydrating(false);
      }
    };
    rehydrate();
  }, []);

  if (hydrating) return <Loader fullScreen />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes — wrapped in Layout (Navbar + Outlet) */}
      <Route
        element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        }
      >
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
