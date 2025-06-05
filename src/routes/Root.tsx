import { Box } from '@chakra-ui/react'
import { Navbar } from 'components/navbar'
import { Outlet } from 'react-router-dom'

import 'styles/main.css'

const Root = () => {
    return (
        <div className="rootContainer">
            <Box>
                <Navbar logo="/images/diamondgs.png" />
            </Box>
            <Box className="main">
                <Outlet />
            </Box>
        </div>
    )
}

export { Root }
