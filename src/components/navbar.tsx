import {
  Box,
  Flex,
  IconButton,
  Image,
  Tooltip,
  BoxProps,
  Icon,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getInstrumentConnectionStatus } from 'loaders/general'
import React, { useEffect } from 'react'
import { MdSignalWifi4Bar, MdOutlineSignalWifiBad } from 'react-icons/md'
import { TbMicroscope, TbSnowflake, TbHomeCog } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'

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
    <Box position="sticky" top="0" zIndex={1} w="100%" h={12} {...props}>
      <Flex
        px={{
          base: 4,
          md: 12,
        }}
        py={2}
        gap={2}
        direction="row"
        alignItems="center"
        bg="murfey.800"
      >
        {logo ? (
          <Box maxW={24}>
            <Image src={logo} objectFit="contain" />
          </Box>
        ) : null}
        <Tooltip label="Back to the Hub">
          <IconButton
            onClick={() => {
              navigate(`/hub`)
            }}
            size="sm"
            icon={
              <>
                <TbHomeCog />
              </>
            }
            aria-label="Back to the Hub"
            _hover={{ background: 'transparent', color: 'murfey.500' }}
          />
        </Tooltip>
        {/* Add the instrument name as a URL query parameter to trigger a reload */}
        <Tooltip label="Back to the microscope">
          <IconButton
            onClick={() => {
              navigate(`/home`)
            }}
            size="sm"
            icon={
              <>
                <TbSnowflake />
                <TbMicroscope />
              </>
            }
            aria-label="Back to the microscope"
            _hover={{ background: 'transparent', color: 'murfey.500' }}
          />
        </Tooltip>
        <Tooltip
          label={
            instrumentServerConnected
              ? 'Connected to instrument server'
              : 'No instrument server connection'
          }
        >
          <span tabIndex={0}>
            <Icon
              as={
                instrumentServerConnected
                  ? MdSignalWifi4Bar
                  : MdOutlineSignalWifiBad
              }
              color={instrumentServerConnected ? 'white' : 'red'}
              mt={2}
              ml={1}
            />
          </span>
        </Tooltip>
      </Flex>
    </Box>
  )
}
