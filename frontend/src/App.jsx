// src/App.jsx
import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from './Login'
import WelcomePage from './components/WelcomePage'      // ← import
import TenantPage from './pages/TenantPage'
import TenantDetails from './components/TenantDetails'
import Reports from './components/Reports'
import Cashbook from './components/Cashbook'
import PaymentsPage from './components/Payments'
import AdminDashboard from './components/AdminDashboard'
import AdminNav from './components/AdminNav'
import AgentNav from './components/Navbar'

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" replace />
}

const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem('token')
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  return token && isAdmin ? children : <Navigate to="/" replace />
}

const DesktopGuard = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  if (!isDesktop) {
    return (
      <div className="flex items-center justify-center h-screen text-center px-4">
        <p className="text-lg font-semibold">
          This site is only accessible on desktop screens. Please switch to a
          device with a width of at least 768px.
        </p>
      </div>
    )
  }
  return children
}

const App = () => {
  const [tokenState, setTokenState] = useState(localStorage.getItem('token') || '')
  const [isAdminState, setIsAdminState] = useState(localStorage.getItem('isAdmin') === 'true')
  // (Optional) manager name in localStorage; set this when logging in:
  const [managerName, _] = useState(localStorage.getItem('managerName') || 'Manager')

  useEffect(() => {
    if (tokenState) {
      localStorage.setItem('token', tokenState)
      localStorage.setItem('isAdmin', isAdminState ? 'true' : 'false')
      // (Optional) you could save managerName in localStorage inside Login
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('managerName')
    }
  }, [tokenState, isAdminState])

  const handleLogout = () => {
    setTokenState('')
    setIsAdminState(false)
    // localStorage cleared in useEffect
  }

  return (
    <Router>
      {tokenState && isAdminState && <AdminNav />}
      {tokenState && !isAdminState && <AgentNav />}

      <Routes>
        {/* “/” shows WelcomePage if logged in; otherwise Login */}
        <Route
          path="/"
          element={
            tokenState ? (
              <WelcomePage managerName={managerName} onLogout={handleLogout} />
            ) : (
              <Login
                setToken={(t) => {
                  setTokenState(t)
                  // assume Login also does: localStorage.setItem('managerName', returnedName)
                }}
                setIsAdmin={(flag) => setIsAdminState(flag)}
              />
            )
          }
        />

        {/* everything else requires desktop + auth */}
        <Route
          path="/*"
          element={
            <DesktopGuard>
              <RequireAuth>
                <Routes>
                  <Route path="tenants" element={<TenantPage />} />
                  <Route path="tenants/:posId" element={<TenantPage />} />
                  <Route path="reconciliation/:tenantId" element={<TenantDetails />} />
                  <Route path="cashbook/:posId" element={<Cashbook />} />
                  <Route path="cashbook/:posId/payments" element={<PaymentsPage />} />
                  <Route path="reports" element={<Reports />} />
                  <Route
                    path="add"
                    element={
                      <RequireAdmin>
                        <AdminDashboard />
                      </RequireAdmin>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </RequireAuth>
            </DesktopGuard>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
