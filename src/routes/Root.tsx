import { Box, HStack, Tag, Text, Link, Progress, Icon } from '@chakra-ui/react'
import { Navbar } from 'components/navbar'
import { MdSignalWifi4Bar } from 'react-icons/md'
import { Outlet, useLoaderData, Link as LinkRouter } from 'react-router-dom'

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
