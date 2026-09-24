import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PendingApproval from './pages/auth/PendingApproval'

import ReporterDashboard from './pages/reporter/Dashboard'
import AllTickets from './pages/reporter/AllTickets'
import CreateTicket from './pages/reporter/CreateTicket'

import TicketDetails from './pages/shared/TicketDetails'
import Notifications from './pages/shared/Notifications'

import AgentDashboard from './pages/agent/Dashboard'
import AgentTriage from './pages/agent/Triage'

import TechnicianDashboard from './pages/technician/Dashboard'
import TicketWork from './pages/technician/TicketWork'

import ManagerDashboard from './pages/manager/Dashboard'
import AccountRequests from './pages/manager/AccountRequests'
import UserManagement from './pages/manager/UserManagement'
import Workload from './pages/manager/Workload'
import Configuration from './pages/manager/Configuration'

import RecentChanges from './pages/auditor/RecentChanges'

const ROLE_HOME = {
  reporter: '/reporter',
  agent: '/agent',
  technician: '/technician',
  manager: '/manager',
  auditor: '/auditor',
}

function HomeRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[user?.role?.toLowerCase()] || '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Reporter */}
          <Route
            path="/reporter"
            element={<ProtectedRoute roles={['reporter']}><AppLayout role="reporter" /></ProtectedRoute>}
          >
            <Route index element={<ReporterDashboard />} />
            <Route path="tickets" element={<AllTickets />} />
            <Route path="new" element={<CreateTicket />} />
          </Route>

          {/* Agent */}
          <Route
            path="/agent"
            element={<ProtectedRoute roles={['agent']}><AppLayout role="agent" /></ProtectedRoute>}
          >
            <Route index element={<AgentDashboard />} />
            <Route path="triage/:id" element={<AgentTriage />} />
          </Route>

          {/* Technician */}
          <Route
            path="/technician"
            element={<ProtectedRoute roles={['technician']}><AppLayout role="technician" /></ProtectedRoute>}
          >
            <Route index element={<TechnicianDashboard />} />
            <Route path="work/:id" element={<TicketWork />} />
          </Route>

          {/* Manager */}
          <Route
            path="/manager"
            element={<ProtectedRoute roles={['manager']}><AppLayout role="manager" /></ProtectedRoute>}
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="accounts" element={<AccountRequests />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="workload" element={<Workload />} />
            <Route path="config" element={<Configuration />} />
          </Route>

          {/* Auditor */}
          <Route
            path="/auditor"
            element={<ProtectedRoute roles={['auditor']}><AppLayout role="auditor" showSearch={false} /></ProtectedRoute>}
          >
            <Route index element={<RecentChanges />} />
          </Route>

          {/* Shared, any authenticated role — layout picks the sidebar based on the logged-in user's role */}
          <Route
            path="/"
            element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
          >
            <Route index element={<HomeRedirect />} />
            <Route path="ticket/:id" element={<TicketDetails />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}