import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CloseIcon from '@mui/icons-material/Close'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import GridOnIcon from '@mui/icons-material/GridOn'
import PauseIcon from '@mui/icons-material/Pause'
import SyncIcon from '@mui/icons-material/Sync'
import TuneIcon from '@mui/icons-material/Tune'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from '@tanstack/react-query'
import { InstrumentCard } from 'components/instrumentCard'
import { RsyncCard } from 'components/rsyncCard'
import { UpstreamVisitsCard } from 'components/upstreamVisitsCard'
import { getInstrumentConnectionStatus } from 'loaders/general'
import { sessionTokenCheck, sessionHandshake } from 'loaders/jwt'
import { getMachineConfigData } from 'loaders/machineConfig'
import {
  startMultigridWatcher,
  setupMultigridWatcher,
} from 'loaders/multigridSetup'
import { getSessionProcessingParameterData } from 'loaders/processingParameters'
import { getRsyncerData, pauseRsyncer, finaliseSession } from 'loaders/rsyncers'
import { updateVisitEndTime, getSessionData } from 'loaders/sessionClients'
import { checkMultigridControllerStatus } from 'loaders/sessionSetup'
import React, { useEffect, useCallback } from 'react'
import { GiMagicBroom } from 'react-icons/gi'
import { useLoaderData, useParams, useNavigate } from 'react-router-dom'
import { components } from 'schema/main'
import { colours, onBlueButtonSx } from 'styles/colours'
import { convertUKNaiveToUTC, convertUTCToUKNaive } from 'utils/generic'

type RSyncerInfo = components['schemas']['RSyncerInfo']
type SessionSchema = components['schemas']['Session']
type MachineConfig = components['schemas']['MachineConfig']
type MultigridWatcherSpec = components['schemas']['MultigridWatcherSetup']

export const Session = () => {
  // ----------------------------------------------------------------------------------
  // Routing and loader context
  const { sessid } = useParams() as { sessid: string }
  const instrumentName = sessionStorage.getItem('instrumentName')
  const navigate = useNavigate()

  // ----------------------------------------------------------------------------------
  // State hooks
  // Instrument server connection
  const [instrumentServerConnected, setInstrumentServerConnected] =
    React.useState<boolean>(false)

  // Session information
  const [session, setSession] = React.useState<SessionSchema>()
  const [sessionActive, setSessionActive] = React.useState(false)
  const [skipExistingProcessing, setSkipExistingProcessing] =
    React.useState(false)

  // File transfer source information
  const [selectedDirectory, setSelectedDirectory] = React.useState('')

  // Visit end time information
  const [visitEndTime, setVisitEndTime] = React.useState<Date | null>(null)
  const [proposedVisitEndTime, setProposedVisitEndTime] =
    React.useState<Date | null>(null)
  const [triggerVisitEndTimeUpdate, setTriggerVisitEndTimeUpdate] =
    React.useState<Boolean>(false)

  // Machine config and instrument information
  const [machineConfig, setMachineConfig] = React.useState<MachineConfig>()
  const [hasGainReference, setHasGainReference] = React.useState<boolean>(false)
  const [hasProcessingParams, setHasProcessingParams] =
    React.useState<boolean>(false)

  // Rsyncer information
  const [rsyncers, setRsyncers] = React.useState<RSyncerInfo[]>([])
  const [rsyncersPaused, setRsyncersPaused] = React.useState(false)

  // Button rendering conditions
  const theme = useTheme()
  const displayButtonText = useMediaQuery(theme.breakpoints.up('md'))

  // ----------------------------------------------------------------------------------
  // Load Rsyncer data via a polling query
  const preloadedRsyncerData = useLoaderData() as RSyncerInfo[] | null
  const {
    data: rsyncerData,
    isLoading,
    isError,
  } = useQuery<RSyncerInfo[] | null>({
    queryKey: ['rsyncers', sessid],
    queryFn: () => getRsyncerData(sessid),
    enabled: !!sessid,
    initialData: preloadedRsyncerData,
    staleTime: 0,
    refetchInterval: sessionActive ? 5000 : false,
  })
  useEffect(() => {
    if (!rsyncerData) return
    // Sort RSyncers by destination folder before setting the state
    const sortedRsyncers = rsyncerData.sort((a, b) =>
      a.destination.localeCompare(b.destination)
    )
    setRsyncers(sortedRsyncers)
  }, [rsyncerData])

  // Set up a query to probe the instrument server connection status
  const { data: instrmentServerConnectionStatus } = useQuery<boolean>({
    queryKey: ['instrumentServerConnection', instrumentName],
    queryFn: () => getInstrumentConnectionStatus(),
    enabled: !!sessid,
    initialData: sessionActive,
    staleTime: 0,
  })
  useEffect(() => {
    console.log(
      `Instrument server is connected:`,
      instrmentServerConnectionStatus
    )
    setInstrumentServerConnected(instrmentServerConnectionStatus)
  }, [instrmentServerConnectionStatus])

  // ----------------------------------------------------------------------------------
  // UI utility hooks
  const [isOpenVisitComplete, setIsOpenVisitComplete] = React.useState(false)
  const onOpenVisitComplete = () => setIsOpenVisitComplete(true)
  const onCloseVisitComplete = () => setIsOpenVisitComplete(false)

  const [isOpenReconnect, setIsOpenReconnect] = React.useState(false)
  const onOpenReconnect = () => setIsOpenReconnect(true)
  const onCloseReconnect = () => setIsOpenReconnect(false)

  const [isOpenCalendar, setIsOpenCalendar] = React.useState(false)
  const onOpenCalendar = () => setIsOpenCalendar(true)
  const onCloseCalendar = () => setIsOpenCalendar(false)

  // ----------------------------------------------------------------------------------
  // Functions

  // Get machine config and set up related settings
  const handleMachineConfig = (config: MachineConfig) => {
    setMachineConfig(config)
    setSelectedDirectory(config['data_directories'][0])
    setHasGainReference(
      !!(
        !!config.gain_reference_directory &&
        config.gain_reference_directory.trim() !== ''
      )
    )
    setHasProcessingParams(
      !!(config.recipes && Object.keys(config.recipes).length > 0)
    )
  }
  useEffect(() => {
    getMachineConfigData().then((config) => handleMachineConfig(config))
  }, [])

  // Redirect user to earlier stages of the setup depending on what is missing
  useEffect(() => {
    // Exit early if required states are undefined
    if (session === undefined || sessid === undefined || !sessionActive) return

    const runRedirectChecks = async () => {
      // Check if the multigrid controller for the session exists
      const multigridControllerStatus =
        await checkMultigridControllerStatus(sessid)
      if (!multigridControllerStatus.exists) {
        // Check if this instrument has a gain reference directory configured
        if (hasGainReference) {
          // Check if a gain reference file has been uploaded
          if (!!!session.current_gain_ref) {
            // Redirect to the gain reference page
            navigate(
              `/sessions/${sessid}/gain_ref_transfer?sessid=${sessid}&setup=true`
            )
            return
          }
        }
        // Redirect to set up multigrid controller
        navigate(`/new_session/setup/${sessid}`)
        return
      }

      // Check if this instrument has processing recipes configured
      if (hasProcessingParams) {
        // Check if processing parameters have been provided
        getSessionProcessingParameterData(sessid).then((params) => {
          if (params === null && session.process) {
            // Redirect to the processing parameters page
            navigate(`/new_session/parameters/${sessid}`)
            return
          }
        })
      }
    }
    runRedirectChecks() // Call the async function inside the useEffect()
  }, [
    sessid,
    session,
    sessionActive,
    hasGainReference,
    hasProcessingParams,
    navigate,
  ])

  // Load Session page upon initialisation
  const loadSession = useCallback(async () => {
    const sess = await getSessionData(sessid)
    if (sess) {
      setSession(sess.session)
    }
  }, [sessid])
  useEffect(() => {
    loadSession()
  }, [sessid, loadSession])

  // Other Rsync-related functions
  const finaliseAll = async () => {
    if (sessid) await finaliseSession(parseInt(sessid))
    onCloseVisitComplete()
  }

  const pauseAll = async () => {
    rsyncers?.forEach((r) => {
      pauseRsyncer(r.session_id, r.source)
    })
    setRsyncersPaused(true)
  }

  const checkRsyncStatus = useCallback(async () => {
    setRsyncersPaused(rsyncers ? !rsyncers.every(getTransferring) : true)
  }, [rsyncers])

  useEffect(() => {
    checkRsyncStatus()
  }, [checkRsyncStatus])

  const getTransferring = (r: RSyncerInfo) => {
    return r.transferring
  }

  // Update the state of the session when a change in
  // instrument server connection status occurs
  const checkSessionActivationState = useCallback(async () => {
    if (sessid !== undefined) {
      const activationState = await sessionTokenCheck(parseInt(sessid))
      setSessionActive(activationState)
      console.log(`Session is active:`, activationState)
    }
  }, [sessid])
  useEffect(() => {
    checkSessionActivationState()
  }, [checkSessionActivationState, instrumentServerConnected])

  // Set the default visit end time (in UTC) if none was provided
  const defaultVisitEndTime = session?.visit_end_time
    ? (() => {
        let endTime = session.visit_end_time
        return endTime
      })()
    : (() => {
        const now = new Date()
        const fallback = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes(),
          0, // Set seconds to 0
          0 // Set milliseconds to 0
        ).toISOString()
        return fallback
      })()

  // Set the visit end time upon loading of the initial session
  useEffect(() => {
    if (session && session.visit_end_time) {
      setVisitEndTime(new Date(session.visit_end_time))
    } else {
      setVisitEndTime(null)
    }
  }, [session])

  // Update the visit end time only after it's been confirmed
  useEffect(() => {
    if (
      !triggerVisitEndTimeUpdate ||
      !visitEndTime ||
      typeof sessid === 'undefined'
    )
      return
    let registerEndTimeUpdate = async () => {
      await updateVisitEndTime(parseInt(sessid), visitEndTime)
      await loadSession() // Refresh the page with new details
      onCloseCalendar()
      setTriggerVisitEndTimeUpdate(false)
    }
    registerEndTimeUpdate()
  }, [
    sessid,
    visitEndTime,
    triggerVisitEndTimeUpdate,
    loadSession,
    onCloseCalendar,
  ])

  const handleDirectorySelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedDirectory(e.target.value)

  const handleReconnect = async () => {
    if (typeof sessid !== 'undefined') {
      await sessionHandshake(parseInt(sessid))
      await setupMultigridWatcher(
        {
          source: selectedDirectory,
          skip_existing_processing: skipExistingProcessing,
          destination_overrides: rsyncers
            ? Object.fromEntries(rsyncers.map((r) => [r.source, r.destination]))
            : {},
          rsync_restarts: rsyncers ? rsyncers.map((r) => r.source) : [],
        } as MultigridWatcherSpec,
        parseInt(sessid)
      )
      await startMultigridWatcher(parseInt(sessid))
      await checkSessionActivationState()
      onCloseReconnect()
    }
  }

  if (isLoading) return <p>Loading RSyncer data...</p>
  if (isError) return <p>Error loading RSyncer data</p>
  return (
    <div className="rootContainer">
      {/* Logic for pop-up components */}
      <Dialog open={isOpenVisitComplete} onClose={onCloseVisitComplete}>
        <DialogTitle>
          Confirm Visit Completion
          <IconButton
            aria-label="close"
            onClick={onCloseVisitComplete}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove all data associated with this visit?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={onCloseVisitComplete}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => finaliseAll()}
            sx={{ bgcolor: colours.murfey[600].default }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isOpenReconnect} onClose={onCloseReconnect}>
        <DialogTitle>
          Restart Transfers
          <IconButton
            aria-label="close"
            onClick={onCloseReconnect}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>Data directory</Typography>
              <Select
                native
                onChange={
                  handleDirectorySelection as React.ChangeEventHandler<HTMLSelectElement>
                }
              >
                {machineConfig &&
                machineConfig['data_directories'].length > 0 ? (
                  machineConfig['data_directories'].map((value) => {
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    )
                  })
                ) : (
                  <option disabled>No Data Directories Found</option>
                )}
              </Select>
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  id="skip-existing-processing-reconnect"
                  checked={false}
                  onChange={() => {
                    setSkipExistingProcessing(!skipExistingProcessing)
                  }}
                />
              }
              label="Do not process existing data"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={onCloseReconnect}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleReconnect}
            sx={{ bgcolor: colours.murfey[600].default }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isOpenCalendar} onClose={onCloseCalendar} maxWidth="xl">
        <DialogTitle>
          Select data transfer end time
          <IconButton
            aria-label="close"
            onClick={onCloseCalendar}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <input
            aria-label="Date and time"
            type="datetime-local"
            defaultValue={convertUTCToUKNaive(defaultVisitEndTime)}
            onChange={(e) => {
              let timestamp = e.target.value
              timestamp += ':00'
              const newVisitEndTime = new Date(convertUKNaiveToUTC(timestamp))
              setProposedVisitEndTime(newVisitEndTime)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={() => {
              onCloseCalendar()
              setProposedVisitEndTime(null)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (proposedVisitEndTime) {
                setVisitEndTime(proposedVisitEndTime)
                setTriggerVisitEndTimeUpdate(true)
              }
            }}
            sx={{ bgcolor: colours.murfey[600].default }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Parent container for page contents */}
      <Box
        className="homeRoot"
        sx={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          bgcolor: colours.murfey[50].default,
        }}
      >
        {/* Page title bar */}
        <Box
          sx={{
            bgcolor: colours.murfey[700].default,
            width: '100%',
            px: { xs: 4, md: 8 },
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: colours.murfey[50].default, lineHeight: 1 }}
          >
            Session {sessid}: {session ? session.visit : null}
          </Typography>
          {/* Display visit end time if set for this session */}
          {visitEndTime && (
            <Typography
              variant="h5"
              sx={{ color: colours.murfey[50].default, lineHeight: 1 }}
            >
              [Transfer ends at{' '}
              {visitEndTime.toLocaleString('en-GB', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZoneName: 'short',
              })}
              ]
            </Typography>
          )}
          {/* First row of buttons containing transfer-related settings */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: 1,
            }}
          >
            <Tooltip title="Remove files from source folders and delete visit">
              <Button
                key="visit_complete"
                variant="outlined"
                onClick={() => onOpenVisitComplete()}
                sx={onBlueButtonSx}
              >
                {displayButtonText && 'Visit Complete'}
                <GiMagicBroom
                  size={24}
                  style={{ marginLeft: displayButtonText ? 8 : 0 }}
                />
              </Button>
            </Tooltip>
            <Tooltip title="Pause all ongoing transfers">
              <Button
                key="pause_transfers"
                variant="outlined"
                onClick={() => pauseAll()}
                disabled={rsyncersPaused}
                sx={onBlueButtonSx}
              >
                {displayButtonText && 'Pause Transfers'}
                <PauseIcon sx={{ ml: displayButtonText ? 1 : 0 }} />
              </Button>
            </Tooltip>
            <Tooltip title="Update the file transfer end time">
              <Button
                key="update_visit_end_time"
                variant="outlined"
                onClick={() => onOpenCalendar()}
                sx={onBlueButtonSx}
              >
                {displayButtonText && 'Update Visit End Time'}
                <CalendarTodayIcon sx={{ ml: displayButtonText ? 1 : 0 }} />
              </Button>
            </Tooltip>
            {!sessionActive ? (
              <Tooltip title="Reconnect an interrupted session">
                <Button
                  key="reconnect"
                  variant="outlined"
                  onClick={() => onOpenReconnect()}
                  sx={onBlueButtonSx}
                >
                  {displayButtonText && 'Reconnect'}
                  <SyncIcon sx={{ ml: displayButtonText ? 1 : 0 }} />
                </Button>
              </Tooltip>
            ) : (
              <></>
            )}
          </Box>
          {/* Second row of buttons containing processing-related settings */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: 1,
            }}
          >
            <Tooltip title="Inspect data collections">
              <Button
                key="data_collections"
                variant="outlined"
                onClick={() => {
                  navigate(`../sessions/${sessid}/data_collection_groups`)
                }}
                sx={onBlueButtonSx}
              >
                {displayButtonText && 'Data Collections'}
                <GridOnIcon sx={{ ml: displayButtonText ? 1 : 0 }} />
              </Button>
            </Tooltip>
            {hasGainReference ? (
              <Tooltip title="Upload a new gain reference file">
                <Button
                  key="gain_ref"
                  variant="outlined"
                  onClick={() => {
                    navigate(
                      `../sessions/${sessid}/gain_ref_transfer?sessid=${sessid}`
                    )
                  }}
                  sx={onBlueButtonSx}
                >
                  {displayButtonText && 'Upload Gain Reference'}
                  <FileUploadIcon sx={{ ml: displayButtonText ? 1 : 0 }} />
                </Button>
              </Tooltip>
            ) : (
              <></>
            )}
            {hasProcessingParams ? (
              <Tooltip title="View and update processing parameters">
                <Button
                  key="processing_params"
                  variant="outlined"
                  onClick={() => {
                    navigate(`session_parameters`)
                  }}
                  sx={onBlueButtonSx}
                >
                  {displayButtonText && 'Processing Parameters'}
                  <TuneIcon sx={{ ml: displayButtonText ? 1 : 0 }} />
                </Button>
              </Tooltip>
            ) : (
              <></>
            )}
          </Box>
        </Box>
        {/* Page contents */}
        <Box
          sx={{
            p: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-evenly',
            gap: { xs: 4, md: 16 },
            overflow: 'auto',
          }}
        >
          {/* Left column displaying RSyncers for this session */}
          <Box
            sx={{
              minWidth: '400px',
              maxWidth: '600px',
              flex: 1,
              pl: { xs: 4, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: 2,
              overflow: 'auto',
            }}
          >
            <Typography
              variant="h5"
              sx={{ textAlign: 'left', width: '100%', mt: 4, lineHeight: 1 }}
            >
              Transfer Status
            </Typography>
            <Divider
              sx={{ width: '100%', borderColor: colours.murfey[300].default }}
            />
            {rsyncers && rsyncers.length > 0 ? (
              rsyncers.map(
                (r): React.ReactElement => (
                  <RsyncCard
                    key={`${r.session_id}-${r.source}`} // Used by 'map' for ID-ing elements
                    rsyncer={r}
                  />
                )
              )
            ) : (
              <Typography sx={{ width: '100%', py: 2 }}>
                No RSyncers Found
              </Typography>
            )}
          </Box>
          {/* Right column showing instrument card and other buttons */}
          <Box
            sx={{
              minWidth: '400px',
              maxWidth: '600px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: 2,
              overflow: 'auto',
            }}
          >
            <InstrumentCard />
            <UpstreamVisitsCard sessid={parseInt(sessid ?? '0')} />
          </Box>
        </Box>
      </Box>
    </div>
  )
}
