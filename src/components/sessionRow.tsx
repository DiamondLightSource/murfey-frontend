import { keyframes } from '@emotion/react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { finaliseSession } from 'loaders/rsyncers'
import { deleteSessionData } from 'loaders/sessionClients'
import React from 'react'
import { GiMagicBroom } from 'react-icons/gi'
import { MdDelete, MdSync, MdSyncProblem } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type Session = components['schemas']['Session']
type SessionRowProps = {
  session: Session
  instrumentName: string | null
  isActive: boolean
  isFinalising: boolean
}

export const SessionRow = ({
  session,
  instrumentName = null,
  isActive = false,
  isFinalising = false,
}: SessionRowProps) => {
  // Set up query client
  const queryClient = useQueryClient()

  // Set up navigate function
  const navigate = useNavigate()

  // Set up React states
  const [sessionFinalising, setSessionFinalising] = React.useState(isFinalising)
  const [isOpenDelete, setIsOpenDelete] = React.useState(false)
  const [isOpenCleanup, setIsOpenCleanup] = React.useState(false)

  const cleanupSession = async (sessid: number) => {
    const response = await finaliseSession(sessid)
    if (response.success) {
      setSessionFinalising(true)
    }
    console.log(`Session ${sessid} marked for cleanup`)
  }

  // Set up animations for the sync icon
  const spin = keyframes`
    from { transform: translate(-50%, -50%) rotate(360deg); }
    to { transform: translate(-50%, -50%) rotate(0deg); }
  `
  const pulseGlow = keyframes`
    0% { filter: drop-shadow(0 0 2px ${isFinalising ? 'red' : 'green'}) }
    50% { filter: drop-shadow(0 0 0px ${isFinalising ? 'red' : 'green'}) }
    100% { filter: drop-shadow(0 0 2px ${isFinalising ? 'red' : 'green'}) }
  `

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="start"
        gap={1}
      >
        {/* Pop-ups when clicking on component buttons */}
        <Dialog open={isOpenDelete} onClose={() => setIsOpenDelete(false)}>
          <DialogTitle>
            Confirm removing session {session.name} from list
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to continue? This action is not reversible
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsOpenDelete(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                deleteSessionData(session.id).then(() => {
                  // Refetch session information after requesting deletion
                  queryClient.refetchQueries({
                    queryKey: ['homepageSessions', instrumentName],
                  })
                })
                setIsOpenDelete(false)
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={isOpenCleanup} onClose={() => setIsOpenCleanup(false)}>
          <DialogTitle>
            Confirm removing files for session {session.name}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to continue? This action is not reversible
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsOpenCleanup(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                cleanupSession(session.id).then(() => {
                  // Refetch session information after requesting cleanup
                  queryClient.refetchQueries({
                    queryKey: ['homepageSessions', instrumentName],
                  })
                })
                setIsOpenCleanup(false)
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        {/* Session card and buttons */}
        <Tooltip title={session.name}>
          {/* Card containing visit name, session ID, and sync status */}
          <Box
            key={session.id}
            onClick={() => navigate(`../sessions/${session.id ?? 0}`)}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              cursor: 'pointer',
              backgroundColor: colours.murfey[400].default,
              p: 1,
              border: '1px solid grey',
              borderRadius: '5px',
              '&:hover': { borderColor: colours.murfey[500].default },
            }}
          >
            {/* Visit name and ID */}
            <Typography variant="body2" mt="2px" lineHeight={1}>
              {session.name}: {session.id}
            </Typography>
            {/* Sync status */}
            <Box
              position="relative"
              width={24}
              height={24}
              sx={{ aspectRatio: '1' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {isActive ? (
                // Show a pulsing spinning sync icon when running
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    display: 'flex',
                    color: 'black',
                    '@keyframes spin': {
                      from: {
                        transform: 'translate(-50%, -50%) rotate(360deg)',
                      },
                      to: { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    },
                    '@keyframes pulseGlow': {
                      '0%': {
                        filter: `drop-shadow(0 0 2px ${isFinalising ? 'red' : 'green'})`,
                      },
                      '50%': {
                        filter: `drop-shadow(0 0 0px ${isFinalising ? 'red' : 'green'})`,
                      },
                      '100%': {
                        filter: `drop-shadow(0 0 2px ${isFinalising ? 'red' : 'green'})`,
                      },
                    },
                    animation:
                      'spin 2s linear infinite, pulseGlow 2s ease-in-out infinite',
                  }}
                >
                  <MdSync size={24} />
                </Box>
              ) : (
                // Show a sync error icon when disconnected
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    display: 'flex',
                    color: 'black',
                  }}
                >
                  <MdSyncProblem size={24} />
                </Box>
              )}
            </Box>
          </Box>
        </Tooltip>
        <Tooltip title="Remove from list">
          <span>
            <IconButton
              aria-label="Delete session"
              onClick={() => setIsOpenDelete(true)}
              disabled={isActive || sessionFinalising}
              sx={{ backgroundColor: colours.murfey[500].default }}
            >
              <MdDelete />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Clean up visit files">
          <span>
            <IconButton
              aria-label="Clean up session"
              onClick={() => setIsOpenCleanup(true)}
              disabled={!isActive || sessionFinalising}
              sx={{ backgroundColor: colours.murfey[500].default }}
            >
              <GiMagicBroom />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </>
  )
}
