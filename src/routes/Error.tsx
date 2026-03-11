import { Navbar } from '@diamondlightsource/ui-components'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useRouteError } from 'react-router-dom'
import { colours } from 'styles/colours'

interface ErrorType {
  status: number
  statusText: string
  data?: string
}

const Error = () => {
  const [heading, setHeading] = useState('')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState('')
  const error = useRouteError() as ErrorType

  useEffect(() => {
    console.error(error)
    if (error.status === 404) {
      setHeading('Page not found')
      setMessage('This page does not exist.')
    } else {
      setHeading('An error has occurred')
      setMessage(
        'An unexpected error has occurred. If this persists, please contact the developers. Details:'
      )
      setDetails(error.toString())
    }
  }, [error])

  return (
    <div className="rootContainer">
      <Navbar logo={'/images/diamondgs.png'} />
      <Box sx={{ mt: 12 }} className="main">
        <Stack
          height="100%"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="h4" sx={{ color: colours.murfey[800].default }}>
            {heading}
          </Typography>
          <Typography sx={{ color: colours.murfey[300].default }}>
            {message}
          </Typography>
          {details && (
            <Box
              component="code"
              sx={{
                fontFamily: 'monospace',
                width: '50%',
                overflow: 'visible',
                p: 3,
                bgcolor: colours.murfey[100].default,
                color: colours.murfey[800].default,
                borderRadius: 1,
              }}
            >
              {details}
            </Box>
          )}
          <Link href="/" sx={{ color: colours.murfey[600].default }}>
            Go home
          </Link>
        </Stack>
      </Box>
    </div>
  )
}

export { Error }
