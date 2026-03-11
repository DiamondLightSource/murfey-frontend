import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getJWT } from 'loaders/jwt'
import React from 'react'
import { TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { useNavigate, Navigate } from 'react-router-dom'
import { colours } from 'styles/colours'

const Login = () => {
  const [username, setUsername] = React.useState('')
  const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(event.target.value)
  const [password, setPassword] = React.useState('')
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value)

  const navigate = useNavigate()

  return sessionStorage.getItem('murfeyServerURL') ? (
    <Box
      sx={{
        bgcolor: colours.murfey[700].default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
        px: '10vw',
        py: '1vh',
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: colours.murfey[50].default, mb: 2 }}
      >
        <Stack direction="row" spacing={1} component="span" sx={{ mb: 0.5 }}>
          <TbSnowflake />
          <TbMicroscope />
        </Stack>
        Murfey Login
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <TextField placeholder="Username" onChange={handleUsername} />
            <TextField
              placeholder="Password"
              onChange={handlePassword}
              type="password"
            />
            <Button
              variant="contained"
              sx={{ bgcolor: colours.murfey[600].default }}
              onClick={() => {
                getJWT({ username: username, password: password })
                  .then((jwt) =>
                    sessionStorage.setItem('token', jwt.access_token)
                  )
                  .then(() => {
                    let instrumentName =
                      sessionStorage.getItem('instrumentName')
                    if (instrumentName) {
                      navigate(`/home`)
                    } else {
                      console.error('Could not find instument information')
                    }
                  })
              }}
            >
              Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  ) : (
    <Navigate to="/hub" replace />
  )
}

export { Login }
