import { Navigate, Outlet } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { Navbar } from 'components/navbar'

const ProtectedRoutes = () => {
  // Read environment variable and demand user login if authenticating with 'password'
  const sessionToken = sessionStorage.getItem('token')
  const standard = (
    <div className="rootContainer">
      <Box>
        <Navbar logo="/images/diamondgs.png" />
      </Box>
      <Box className="main">
        <Outlet />
      </Box>
    </div>
  )
  return process.env.REACT_APP_BACKEND_AUTH_TYPE === 'cookie' ? (
    standard
  ) : sessionToken ? (
    standard
  ) : (
    <Navigate to="/login" replace />
  )
}

export { ProtectedRoutes }
