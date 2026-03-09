import DensityMediumIcon from '@mui/icons-material/DensityMedium'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import {
  requestSymlinkCreation,
  pauseRsyncer,
  restartRsyncer,
  removeRsyncer,
  finaliseRsyncer,
  flushSkippedRsyncer,
} from 'loaders/rsyncers'
import React from 'react'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type RSyncerInfo = components['schemas']['RSyncerInfo']

const tagColor = (
  tag: string
): 'success' | 'secondary' | 'warning' | 'error' => {
  if (tag === 'fractions') return 'success'
  if (tag === 'metadata') return 'secondary'
  if (tag === 'atlas') return 'warning'
  return 'error'
}

export const RsyncCard = ({ rsyncer }: { rsyncer: RSyncerInfo }) => {
  const destinationParent = rsyncer.destination
    .split('/')
    .slice(0, -2)
    .join('/')
  const destinationName = rsyncer.destination.split('/')[-1]
  const [isOpenRsyncerAction, setIsOpenRsyncerAction] = React.useState(false)
  const [isOpenSymlink, setIsOpenSymlink] = React.useState(false)
  const [rsyncerAction, setRsyncerAction] = React.useState('finalise')
  const [symlinkPath, setSymlinkPath] = React.useState(destinationName)
  const [symlinkOverride, setSymlinkOverride] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  )

  const finalise = () => {
    setRsyncerAction('finalise')
    setIsOpenRsyncerAction(true)
  }

  const remove = () => {
    setRsyncerAction('remove')
    setIsOpenRsyncerAction(true)
  }

  const handleRsyncerAction = async () => {
    if (rsyncerAction === 'finalise') {
      await finaliseRsyncer(rsyncer.session_id, rsyncer.source)
    } else if (rsyncerAction === 'remove') {
      await removeRsyncer(rsyncer.session_id, rsyncer.source)
    }
    setIsOpenRsyncerAction(false)
  }

  const handleCreateSymlink = async () => {
    await requestSymlinkCreation(
      rsyncer.session_id,
      rsyncer.destination,
      destinationParent + '/' + symlinkPath,
      symlinkOverride
    )
    setIsOpenSymlink(false)
  }

  const closeMenu = () => setMenuAnchorEl(null)

  return (
    <Card
      sx={{
        width: '100%',
        backgroundColor: rsyncer.alive
          ? colours.murfey[400].default
          : '#DF928E',
        border: `1px solid ${colours.murfey[300].default}`,
        '&:hover': {
          borderColor: colours.murfey[500].default,
        },
      }}
    >
      {/* Pop-up components */}
      <Dialog
        open={isOpenRsyncerAction}
        onClose={() => setIsOpenRsyncerAction(false)}
      >
        <DialogTitle>
          Confirm RSyncer {rsyncerAction}: {rsyncer.source}
        </DialogTitle>
        <DialogContent>Are you sure you want to continue?</DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setIsOpenRsyncerAction(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => handleRsyncerAction()}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isOpenSymlink} onClose={() => setIsOpenSymlink(false)}>
        <DialogTitle>Create Symlink to {rsyncer.destination}</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a symlink to {rsyncer.destination} on the file
            system
          </Typography>
          <TextField
            value={symlinkPath}
            autoFocus
            sx={{ width: '80%' }}
            onChange={(v) => setSymlinkPath(v.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={symlinkOverride}
                onChange={(e) => setSymlinkOverride(e.target.checked)}
              />
            }
            label="Replace any existing symlink with this name?"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setIsOpenSymlink(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => handleCreateSymlink()}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <CardContent>
        {/* Box containing card contents */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            justifyContent: 'start',
            gap: 2,
          }}
        >
          {/* Title bar of RSync card */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'start',
                gap: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" lineHeight={1}>
                RSync Instance
              </Typography>
              <Chip
                label={rsyncer.tag}
                color={tagColor(rsyncer.tag)}
                size="small"
              />
              <Box
                sx={{
                  mx: 1,
                  width: 32,
                  height: 32,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {rsyncer.transferring && rsyncer.alive ? (
                  <CircularProgress
                    size={32}
                    sx={{ color: colours.murfey[700].default }}
                  />
                ) : (
                  <></>
                )}
              </Box>
            </Box>
            <IconButton
              aria-label="Rsync control options"
              onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            >
              <DensityMediumIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={closeMenu}
            >
              {rsyncer.alive
                ? [
                    <MenuItem
                      key="symlink"
                      onClick={() => {
                        setIsOpenSymlink(true)
                        closeMenu()
                      }}
                    >
                      Create symlink
                    </MenuItem>,
                    <MenuItem
                      key="pause"
                      onClick={() => {
                        pauseRsyncer(rsyncer.session_id, rsyncer.source)
                        closeMenu()
                      }}
                      disabled={rsyncer.stopping}
                    >
                      Pause
                    </MenuItem>,
                    <MenuItem
                      key="flush"
                      onClick={() => {
                        flushSkippedRsyncer(rsyncer.session_id, rsyncer.source)
                        closeMenu()
                      }}
                      disabled={rsyncer.stopping}
                    >
                      Flush skipped files
                    </MenuItem>,
                    <MenuItem
                      key="stop"
                      onClick={() => {
                        remove()
                        closeMenu()
                      }}
                      disabled={rsyncer.stopping}
                    >
                      Stop rsync (cannot be resumed)
                    </MenuItem>,
                    <MenuItem
                      key="finalise"
                      onClick={() => {
                        finalise()
                        closeMenu()
                      }}
                      disabled={rsyncer.stopping}
                    >
                      Remove all source files and stop
                    </MenuItem>,
                  ]
                : [
                    <MenuItem
                      key="start"
                      onClick={() => {
                        restartRsyncer(rsyncer.session_id, rsyncer.source)
                        closeMenu()
                      }}
                    >
                      Start
                    </MenuItem>,
                    <MenuItem
                      key="remove"
                      onClick={() => {
                        remove()
                        closeMenu()
                      }}
                    >
                      Remove
                    </MenuItem>,
                  ]}
            </Menu>
          </Box>

          {/* Contents of RSync card */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              justifyContent: 'start',
              gap: 1,
            }}
          >
            {/* Source */}
            <Typography
              pt={2}
              variant="caption"
              textTransform="uppercase"
              lineHeight={1}
            >
              Source
            </Typography>
            <Typography
              variant="body2"
              lineHeight={1}
              sx={{ overflowWrap: 'anywhere' }}
            >
              {rsyncer.source}
            </Typography>
            <Divider
              sx={{ borderColor: colours.murfey[300].default, width: '100%' }}
            />

            {/* Destination */}
            <Typography
              pt={2}
              variant="caption"
              textTransform="uppercase"
              lineHeight={1}
            >
              Destination
            </Typography>
            <Typography
              variant="body2"
              lineHeight={1}
              sx={{ overflowWrap: 'anywhere' }}
            >
              {rsyncer.destination ?? ''}
            </Typography>
            <Divider
              sx={{ borderColor: colours.murfey[300].default, width: '100%' }}
            />

            {/* Transfer progress */}
            <Typography
              pt={2}
              variant="caption"
              textTransform="uppercase"
              lineHeight={1}
            >
              Transfer progress
            </Typography>
            <Typography variant="h6" fontWeight="bold" lineHeight={1}>
              {rsyncer.num_files_transferred} transferred
            </Typography>
            <Typography variant="h6" fontWeight="bold" lineHeight={1}>
              {rsyncer.num_files_in_queue} queued
            </Typography>
            <Typography variant="h6" fontWeight="bold" lineHeight={1}>
              {rsyncer.num_files_skipped} skipped
            </Typography>
            {rsyncer.analyser_alive ? (
              <Typography variant="h6" fontWeight="bold" lineHeight={1}>
                {rsyncer.num_files_to_analyse} to analyse
              </Typography>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
