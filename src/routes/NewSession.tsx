import { Table } from '@diamondlightsource/ui-components'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { SetupStepper } from 'components/setupStepper'
import { sessionTokenCheck, sessionHandshake } from 'loaders/jwt'
import { getMachineConfigData } from 'loaders/machineConfig'
import { createSession, getSessionDataForVisit } from 'loaders/sessionClients'
import React, { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link as LinkRouter, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'
import {
  convertUTCToUKNaive,
  convertUKNaiveToUTC,
  formatUTCISOToUKLocal,
} from 'utils/generic'

type Visit = components['schemas']['Visit']
type MachineConfig = components['schemas']['MachineConfig']
type Session = components['schemas']['Session']

const NewSession = () => {
  // Load visits and add columns where they are formatted
  const currentVisits = useLoaderData() as Visit[] | null
  const formattedVisits: Visit[] = currentVisits
    ? currentVisits.map((visit) => ({
        ...visit,
        // Add new columns with the formatted timestamps for use in the table
        startFormatted: formatUTCISOToUKLocal(visit.start),
        endFormatted: formatUTCISOToUKLocal(visit.end),
      }))
    : []

  const [isOpen, setIsOpen] = React.useState(false)
  const [isOpenVisitCheck, setIsOpenVisitCheck] = React.useState(false)
  const [isOpenCalendar, setIsOpenCalendar] = React.useState(false)
  const [selectedVisit, setSelectedVisit] = React.useState('')
  const [sessionReference, setSessionReference] = React.useState('')
  const [activeSessionsForVisit, setActiveSessionsForVisit] = React.useState<
    (Session | null)[]
  >([])
  const [gainRefDir, setGainRefDir] = React.useState<string | null>()
  const [endTime, setEndTime] = React.useState<Date | null>(null)
  const [proposedEndTime, setProposedEndTime] = React.useState<Date | null>(
    null
  )

  const navigate = useNavigate()

  // Upon initialisation, zero out seconds field
  const defaultVisitEndTime = (() => {
    let now = new Date()
    let timestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0, // Set seconds to 0
      0 // Set milliseconds to 0
    ).toISOString()
    return timestamp
  })()

  const handleMachineConfig = (mcfg: MachineConfig) => {
    setGainRefDir(mcfg.gain_reference_directory)
  }

  const instrumentName = sessionStorage.getItem('instrumentName')

  const alreadyActiveSessions = useCallback(async () => {
    const sessionsToCheck: Session[] = await getSessionDataForVisit(
      selectedVisit,
      instrumentName ?? ''
    )
    return Promise.all(
      sessionsToCheck.map(async (session) => {
        return (await sessionTokenCheck(session.id)) ? session : null
      })
    )
  }, [selectedVisit, instrumentName])

  useEffect(() => {
    getMachineConfigData().then((mcfg) => handleMachineConfig(mcfg))
  }, [])
  useEffect(() => {
    alreadyActiveSessions().then((sessions) =>
      setActiveSessionsForVisit(sessions)
    )
  }, [selectedVisit, alreadyActiveSessions])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSessionReference(event.target.value)

  const handleVisitNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedVisit(event.target.value)
    setSessionReference(event.target.value)
  }

  function selectVisit(data: Record<string, any>, index: number) {
    setSelectedVisit(data.name)
    setSessionReference(data.name)
    // Add an hour to the listed end time
    const endTime = new Date(new Date(data.end).getTime() + 3600 * 1000 * 2)
    setEndTime(endTime)
  }

  const startMurfeySession = async (iName: string) => {
    const sid = await createSession(
      selectedVisit,
      sessionReference,
      iName,
      endTime
    )
    await sessionHandshake(sid)
    return sid
  }

  const handleCreateSession = async (iName: string) => {
    if (
      !activeSessionsForVisit.length ||
      activeSessionsForVisit.every((elem) => {
        return elem === null
      })
    ) {
      const sid = await startMurfeySession(iName)
      gainRefDir
        ? navigate(
            `../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true`
          )
        : navigate(`/new_session/setup/${sid}`)
    } else setIsOpenVisitCheck(true)
  }

  return instrumentName ? (
    <div className="rootContainer">
      {/* Create session modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>
          Create session
          <IconButton
            aria-label="close"
            onClick={() => setIsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <TextField
            placeholder="Session name"
            onChange={handleVisitNameChange}
            size="small"
          />
          <TextField
            placeholder="Session reference"
            value={sessionReference}
            onChange={handleChange}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            disabled={selectedVisit === ''}
            onClick={() => {
              handleCreateSession(instrumentName)
            }}
            sx={{ bgcolor: colours.murfey[600].default }}
          >
            Create session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Active session warning modal */}
      <Dialog
        open={isOpenVisitCheck}
        onClose={() => setIsOpenVisitCheck(false)}
      >
        <DialogTitle>
          An active session already exists for this visit
          <IconButton
            aria-label="close"
            onClick={() => setIsOpenVisitCheck(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Typography>
            You may want to edit one of the following sessions instead
            (otherwise you may start multiple transfers for the same source)
          </Typography>
          <Stack spacing={1}>
            {activeSessionsForVisit.map((session) => {
              return session ? (
                <Button
                  key={session.id}
                  variant="contained"
                  component={LinkRouter}
                  to={`/sessions/${session.id}`}
                  sx={{ bgcolor: colours.murfey[600].default }}
                >
                  {session.id}
                </Button>
              ) : (
                <></>
              )
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            disabled={selectedVisit === ''}
            onClick={() => {
              startMurfeySession(instrumentName).then((sid: number) => {
                gainRefDir
                  ? navigate(
                      `../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true`
                    )
                  : navigate(`/new_session/setup/${sid}`)
              })
            }}
          >
            Ignore and continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar/end time modal */}
      <Dialog
        open={isOpenCalendar}
        onClose={() => setIsOpenCalendar(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Select data transfer end time
          <IconButton
            aria-label="close"
            onClick={() => setIsOpenCalendar(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <input
            aria-label="Date and time"
            type="datetime-local"
            // Convert UTC into local UK time, and set seconds to 0
            defaultValue={
              convertUTCToUKNaive(defaultVisitEndTime).slice(0, 16) + ':00'
            }
            onChange={(e) => {
              // The seconds field is removed when it's 0, so add it back
              let timestamp = e.target.value
              timestamp += ':00'
              // Find the equivalent UTC time and save that
              let newEndTime = new Date(convertUKNaiveToUTC(timestamp))
              setProposedEndTime(newEndTime)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={() => {
              setIsOpenCalendar(false)
              setProposedEndTime(null)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (proposedEndTime) {
                setEndTime(proposedEndTime)
                setIsOpenCalendar(false)
              }
            }}
            sx={{ bgcolor: colours.murfey[600].default }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ width: '100%', bgcolor: colours.murfey[50].default }}>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Box className="homeRoot">
            <Box
              sx={{
                bgcolor: colours.murfey[700].default,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                px: '10vw',
                py: '1vh',
              }}
            >
              <Typography
                variant="h4"
                sx={{ color: colours.murfey[50].default }}
              >
                Current visits
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setIsOpen(true)}
                sx={{
                  color: colours.murfey[500].default,
                  borderColor: colours.murfey[500].default,
                  '&:hover': {
                    color: colours.murfey[300].default,
                    bgcolor: colours.murfey[500].default,
                  },
                }}
              >
                Create session
              </Button>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            mt: '1em',
            px: '10vw',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SetupStepper activeStepIndex={0} />
        </Box>
        <Box
          sx={{
            mt: '1em',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Table
            data={formattedVisits}
            headers={[
              { key: 'name', label: 'Name' },
              { key: 'startFormatted', label: 'Start Time' },
              { key: 'endFormatted', label: 'End Time' },
              { key: 'proposal_title', label: 'Description' },
            ]}
            label={'visitData'}
            onClick={selectVisit}
          />
        </Box>
        <Box
          sx={{
            mt: '1em',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Stack spacing={2}>
            <TextField
              placeholder="Session reference"
              value={sessionReference}
              onChange={handleChange}
              size="small"
            />
            <Stack spacing={2} alignItems="center">
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Stack spacing={1}>
                      <Typography>Transfers will stop after:</Typography>
                      <Typography>
                        {endTime
                          ? new Intl.DateTimeFormat('en-GB', {
                              timeZone: 'Europe/London',
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              timeZoneName: 'short',
                              hour12: false,
                            }).format(endTime)
                          : 'NOT SET'}
                      </Typography>
                    </Stack>
                    <Tooltip title="Set end time for data transfer">
                      <IconButton
                        aria-label="calendar-for-end-time"
                        onClick={() => setIsOpenCalendar(true)}
                      >
                        <CalendarTodayIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
              <Button
                variant="contained"
                disabled={selectedVisit === ''}
                onClick={() => {
                  handleCreateSession(instrumentName)
                }}
                sx={{ bgcolor: colours.murfey[600].default }}
              >
                Create session for visit {selectedVisit}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </div>
  ) : (
    <></>
  )
}

export { NewSession }
