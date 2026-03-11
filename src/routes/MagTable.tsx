import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { addMagTableRow, removeMagTableRow } from 'loaders/magTable'
import React from 'react'
import { useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type MagTableRow = components['schemas']['MagnificationLookup']

export const MagTable = () => {
  const magTable = useLoaderData() as MagTableRow[] | null
  const [isOpen, setIsOpen] = React.useState(false)
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  const handleRemoveRow = (mag: number) => {
    removeMagTableRow(mag)
    window.location.reload()
  }

  const handleForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const mag = parseInt(formData.get('magnification') as string)
    const pixelSize = parseFloat(formData.get('pixelSize') as string)
    addMagTableRow(mag, pixelSize)
    window.location.reload()
  }

  return (
    <div className="rootContainer">
      <title>Murfey</title>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>
          Add Mag Table Row
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleForm}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                placeholder="Magnification"
                name="magnification"
                size="small"
              />
              <TextField
                placeholder="Pixel size (Angstroms)"
                name="pixelSize"
                size="small"
              />
            </Stack>
            <Button
              variant="contained"
              type="submit"
              sx={{ bgcolor: colours.murfey[600].default }}
            >
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: colours.murfey[50].default, lineHeight: 1 }}
          >
            Magnification Table
          </Typography>
        </Box>
        <Box sx={{ px: { xs: 4, md: 8 }, pt: 2 }}>
          <TableContainer>
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Magnification</TableCell>
                  <TableCell>Pixel Size</TableCell>
                  <TableCell>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {magTable && magTable.length > 0 ? (
                  magTable.map((row) => (
                    <TableRow key={row.magnification}>
                      <TableCell>{row.magnification}</TableCell>
                      <TableCell>{row.pixel_size}</TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="Remove row from database"
                          onClick={() => handleRemoveRow(row.magnification)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <></>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>
                    <IconButton
                      aria-label="Add row to mag table"
                      onClick={onOpen}
                    >
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </MuiTable>
          </TableContainer>
        </Box>
      </Box>
    </div>
  )
}
