import { Navbar as SciNavbar } from '@diamondlightsource/sci-react-ui'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useQuery } from '@tanstack/react-query'
import { getInstrumentConnectionStatus } from 'loaders/general'
import React, { useEffect } from 'react'
import { MdOutlineSignalWifiBad, MdSignalWifi4Bar } from 'react-icons/md'
import { TbHomeCog, TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { colours } from 'styles/colours'

export interface NavbarProps {
  logo?: string | null
}

export const Navbar = ({ logo }: NavbarProps) => {
  const [instrumentServerConnected, setInstrumentServerConnected] =
    React.useState(false)
  const navigate = useNavigate()
  const instrumentName = sessionStorage.getItem('instrumentName')

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
    <SciNavbar
      logo={logo ? { src: logo, alt: 'Diamond Light Source logo' } : undefined}
      sx={{ backgroundColor: colours.murfey[800].default }}
    >
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
    </SciNavbar>
  )
}
