import { Box, Card, CardContent, Typography } from '@mui/material'
import { getInstrumentName } from 'loaders/general'
import React, { useEffect } from 'react'
import { colours } from 'styles/colours'

const getUrl = (endpoint: string) => {
  return (
    (sessionStorage.getItem('murfeyServerURL') ??
      process.env.REACT_APP_API_ENDPOINT) + endpoint
  )
}

export const InstrumentCard = () => {
  const [instrumentName, setInstrumentName] = React.useState('')

  // const navigate = useNavigate()

  const resolveName = async () => {
    const name: string = await getInstrumentName()
    setInstrumentName(name)
  }
  useEffect(() => {
    resolveName()
  }, [])

  return (
    <Card
      key="mag_table"
      variant="outlined"
      sx={{
        width: '100%',
        cursor: 'default',
        '&:hover': { borderColor: colours.murfey[400].default },
      }}
      // Mag table is disabled until backend is fixed
      // onClick={() => {
      //   navigate(`../mag_table`)
      // }}
    >
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              component="img"
              src={getUrl(
                `display/instruments/${sessionStorage.getItem('instrumentName')}/image/`
              )}
              sx={{
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '600px',
              }}
            />
          </Box>
          <Typography align="center">{instrumentName}</Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
