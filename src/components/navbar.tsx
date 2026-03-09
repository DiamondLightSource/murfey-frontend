import { Box, BoxProps, IconButton, Tooltip } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getInstrumentConnectionStatus } from 'loaders/general'
import React, { useEffect } from 'react'
import { MdOutlineSignalWifiBad, MdSignalWifi4Bar } from 'react-icons/md'
import { TbHomeCog, TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { colours } from 'styles/colours'

export interface LinkDescriptor {
  label: string
  route: string
}

interface BaseLinkProps {
  links?: LinkDescriptor[]
  as?: React.ElementType
}

export interface NavbarProps extends BaseLinkProps, BoxProps {
  logo?: string | null
  children?: React.ReactElement
}

export const Navbar = ({
  links,
  as,
  children,
  logo,
  ...props
}: NavbarProps) => {
  const [instrumentServerConnected, setInstrumentServerConnected] =
    React.useState(false)
  const navigate = useNavigate()
  const instrumentName = sessionStorage.getItem('instrumentName')

  // Set up a query to poll the instrument server connection status
  const { data: instrumentServerConnectionResponse } = useQuery<boolean>({
    queryKey: ['instrumentServerConnection', instrumentName],
    queryFn: () => getInstrumentConnectionStatus(),
    enabled: !!instrumentName,
    initialData: instrumentServerConnected,
    staleTime: 0,
    refetchInterval: instrumentServerConnected ? 5000 : 10000,
  })
  useEffect(() => {
    setInstrumentServerConnected(!!instrumentServerConnectionResponse)
    console.log(
      `Instrument server connected:`,
      !!instrumentServerConnectionResponse
    )
  }, [instrumentServerConnectionResponse])

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1}
      width="100%"
      height={48}
      {...props}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={1}
        px={{ xs: 2, md: 6 }}
        py={1}
        sx={{ backgroundColor: colours.murfey[800].default }}
      >
        {logo ? (
          <Box
            component="img"
            src={logo}
            sx={{ maxWidth: '6rem', objectFit: 'contain' }}
          />
        ) : null}
        <Tooltip title="Back to the Hub">
          <IconButton
            onClick={() => navigate('/hub')}
            size="small"
            aria-label="Back to the Hub"
            sx={{
              color: 'white',
              '&:hover': {
                background: 'transparent',
                color: colours.murfey[500].default,
              },
            }}
          >
            <TbHomeCog />
          </IconButton>
        </Tooltip>
        {/* Add the instrument name as a URL query parameter to trigger a reload */}
        <Tooltip title="Back to the microscope">
          <IconButton
            onClick={() => navigate('/home')}
            size="small"
            aria-label="Back to the microscope"
            sx={{
              color: 'white',
              '&:hover': {
                background: 'transparent',
                color: colours.murfey[500].default,
              },
            }}
          >
            <TbSnowflake />
            <TbMicroscope />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            instrumentServerConnected
              ? 'Connected to instrument server'
              : 'No instrument server connection'
          }
        >
          <span tabIndex={0}>
            {instrumentServerConnected ? (
              <MdSignalWifi4Bar
                color="white"
                style={{ marginTop: 8, marginLeft: 4 }}
              />
            ) : (
              <MdOutlineSignalWifiBad
                color="red"
                style={{ marginTop: 8, marginLeft: 4 }}
              />
            )}
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
}
