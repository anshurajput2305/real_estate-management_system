import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { Home } from '../pages/public/Home.jsx';
import { Login, Signup, ForgotPassword, ResetPassword, VerifyEmail } from '../pages/public/AuthPages.jsx';
import { Properties } from '../pages/public/Properties.jsx';
import { PropertyDetails } from '../pages/public/PropertyDetails.jsx';
import { About, Contact } from '../pages/public/StaticPages.jsx';
import { AgentAnalytics, AgentListings, AgentProfile } from '../pages/dashboard/AgentPages.jsx';
import { AdminAgents, AdminAnalytics, AdminListings, AdminReports, AdminUsers } from '../pages/dashboard/AdminPages.jsx';
import { AgentDashboard, Bookings, ChatPage, Compare, CustomerDashboard, AdminDashboard, Notifications, Payments, Profile, Wishlist } from '../pages/dashboard/CommonPages.jsx';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/properties', element: <Properties /> },
      { path: '/properties/:slug', element: <PropertyDetails /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> }
    ]
  },
  {
    element: <ProtectedRoute roles={['customer']} />,
    children: [
      {
        path: '/customer',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/customer/dashboard" replace /> },
          { path: 'home', element: <Home /> },
          { path: 'dashboard', element: <CustomerDashboard /> },
          { path: 'properties', element: <Properties /> },
          { path: 'wishlist', element: <Wishlist /> },
          { path: 'compare', element: <Compare /> },
          { path: 'bookings', element: <Bookings mode="customer" /> },
          { path: 'payments', element: <Payments /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'profile', element: <Profile /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute roles={['agent']} />,
    children: [
      {
        path: '/agent',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/agent/dashboard" replace /> },
          { path: 'dashboard', element: <AgentDashboard /> },
          { path: 'listings', element: <AgentListings /> },
          { path: 'bookings', element: <Bookings mode="agent" /> },
          { path: 'analytics', element: <AgentAnalytics /> },
          { path: 'inbox', element: <ChatPage /> },
          { path: 'profile', element: <AgentProfile /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute roles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'agents', element: <AdminAgents /> },
          { path: 'listings', element: <AdminListings /> },
          { path: 'reports', element: <AdminReports /> },
          { path: 'analytics', element: <AdminAnalytics /> }
        ]
      }
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
]);
