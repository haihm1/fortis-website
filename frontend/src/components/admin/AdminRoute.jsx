import { Navigate, useLocation } from 'react-router-dom'

export function AdminRoute({ adminAuth, children }) {
  const location = useLocation()

  if (!adminAuth?.token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}
