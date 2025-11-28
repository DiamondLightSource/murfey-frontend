import {
  Box,
  Flex,
  IconButton,
  Image,
  Tooltip,
  BoxProps,
  Icon,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { getInstrumentConnectionStatus } from 'loaders/general'
import React from 'react'
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
  const [instrumentConnectionStatus, setInsrumentConnectionStatus] =
    React.useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const instrumentName = sessionStorage.getItem('instrumentName')

  // Check connectivity every few seconds
  React.useEffect(() => {
    const resolveConnectionStatus = async () => {
      try {
        const status: boolean = await getInstrumentConnectionStatus()
        if (status !== instrumentConnectionStatus) {
          setInsrumentConnectionStatus(status)
          queryClient.refetchQueries({
            queryKey: ['instrumentServerConnection', instrumentName],
          })
        }
      } catch (err) {
        console.error('Error checking connection status:', err)
        setInsrumentConnectionStatus(false)
      }
    }
    resolveConnectionStatus() // Fetch data once to start with

    // Set it to run every 10s
    const interval = setInterval(resolveConnectionStatus, 10000)
    return () => clearInterval(interval)
  }, [instrumentName, instrumentConnectionStatus, queryClient])

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
            instrumentConnectionStatus
              ? 'Connected to instrument server'
              : 'No instrument server connection'
          }
        >
          <span tabIndex={0}>
            <Icon
              as={
                instrumentConnectionStatus
                  ? MdSignalWifi4Bar
                  : MdOutlineSignalWifiBad
              }
              color={instrumentConnectionStatus ? 'white' : 'red'}
              mt={2}
              ml={1}
              size="sm"
            />
          </span>
        </Tooltip>
      </Flex>
    </Box>
  )
}
