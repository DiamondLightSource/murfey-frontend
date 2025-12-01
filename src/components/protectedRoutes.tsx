import { Box } from '@chakra-ui/react'
import { Navbar } from 'components/navbar'
import { WebSocketHandler } from 'components/webSocketHandler'
import { Navigate, Outlet } from 'react-router-dom'

export const ProtectedRoutes = () => {
  // Read environment variable and demand user login if authenticating with 'password'
  const sessionToken = sessionStorage.getItem('token')
  const standard = (
    <div className="rootContainer">
      <WebSocketHandler />
      {/* Page to display, which occupies full browser window */}
      <Box w="100vw" h="100vh">
        {/* Navigation bar attached to top of page */}
        <Navbar logo="/images/diamondgs.png" />
        {/* Page to be displayed occupies the remaining space */}
        <Box className="main" overflow="auto" flex="1">
          <Outlet />
        </Box>
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
