import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { colours } from 'styles/colours'

const getUrl = (endpoint: string) => {
  return process.env.REACT_APP_HUB_ENDPOINT + endpoint
}

type InstrumentInfo = {
  instrument_name: string
  display_name: string
  instrument_url: string
}

export const Hub = () => {
  const navigate = useNavigate()

  // Get data from loader and store it in a React state
  const data = useLoaderData() as InstrumentInfo[]
  const [instrumentInfo, setInstrumentInfo] = useState<InstrumentInfo[]>()
  useEffect(() => {
    let returnedData = [...data]

    // Logic for duplicating + shuffling data for rendering tests
    let duplicationCount = 0
    let shuffle = false
    // Duplicate the data as many times as is needed
    if (duplicationCount > 0) {
      for (let i = 1; i < duplicationCount + 1; i++) {
        returnedData = returnedData.concat(data)
      }
    }
    // Shuffle the data, if set
    if (shuffle) {
      for (let i = returnedData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[returnedData[i], returnedData[j]] = [returnedData[j], returnedData[i]]
      }
    }

    setInstrumentInfo(returnedData)
  }, [data])

  // When first landing on this page, clear stored session info from browser
  useEffect(() => {
    sessionStorage.removeItem('murfeyServerURL')
    sessionStorage.removeItem('instrumentName')
  }, [])

  const navigateToInstrumentHome = (instrumentInfo: InstrumentInfo) => {
    // Update browser session storage info
    sessionStorage.setItem(
      'murfeyServerURL',
      instrumentInfo.instrument_url + '/'
    )
    sessionStorage.setItem('instrumentName', instrumentInfo.instrument_name)

    // Direct users to /login only if authenticating with 'password'
    if (process.env.REACT_APP_BACKEND_AUTH_TYPE === 'cookie') {
      navigate(`/home`)
    } else {
      navigate(`/login`, { replace: true })
    }
  }

  return (
    // Start with a Box spanning width and height of browser window
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title Bar */}
      <Box
        sx={{
          bgcolor: colours.murfey[700].default,
          width: '100%',
          px: { xs: 8, md: 32 },
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: 2,
        }}
      >
        {/* Show CryoEM icons on one row */}
        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            fontSize: '3rem',
            color: colours.murfey[50].default,
          }}
        >
          <TbSnowflake />
          <TbMicroscope />
        </Box>
        <Typography
          variant="h4"
          sx={{ width: '100%', color: colours.murfey[50].default }}
        >
          Murfey Hub
        </Typography>
      </Box>
      {/* Main body of Hub page showing the instruments */}
      {/* Render as a grid that overflows vertically */}
      <Box
        sx={{
          p: 4,
          width: '100%',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(200px, 600px))',
            sm: 'repeat(2, minmax(200px, 600px))',
            md: 'repeat(3, minmax(200px, 600px))',
            lg: 'repeat(4, minmax(200px, 600px))',
          },
          justifyContent: 'center',
          overflowY: 'auto',
          gap: 4,
        }}
      >
        {instrumentInfo?.map((instrumentInfo, index) => {
          return (
            <Card
              key={index}
              onClick={() => navigateToInstrumentHome(instrumentInfo)}
              variant='outlined'
              sx={{
                width: '100%',
                minHeight: '400px',
                maxHeight: '600px',
                cursor: 'pointer',
                '&:hover': { borderColor: colours.murfey[400].default },
              }}
            >
              <Box
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 4,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={getUrl(
                      `instrument/${instrumentInfo.instrument_name}/image`
                    )}
                    sx={{
                      objectFit: 'contain',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                </Box>
                <Typography textAlign="center">
                  {instrumentInfo.display_name}
                </Typography>
              </Box>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
