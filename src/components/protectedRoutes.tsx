import { Navigate, Outlet } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { Navbar } from 'components/navbar'

const ProtectedRoutes = () => {
    // Read environment variable and demand user login if authenticating with 'password'
    const sessionToken = sessionStorage.getItem('token')
    // if at least one of those is true, use that as the session
    if ([process.env.REACT_APP_BACKEND_AUTH_TYPE === 'cookie', sessionToken !== null].some(v => v === true)) {

        return <div className="rootContainer">
            <Box>
                <Navbar logo="/images/diamondgs.png" />
            </Box>
            <Box className="main">
                <Outlet />
            </Box>
        </div>
    }
    return <Navigate to="/login" replace />
}

export { ProtectedRoutes }
