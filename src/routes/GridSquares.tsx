import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { GridSquareCard } from 'components/gridSquareCard'
import { useLoaderData, useParams } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type GridSquare = components['schemas']['GridSquare']

export const GridSquares = () => {
  console.log('Getting grid squares')
  const gridSquares = useLoaderData() as GridSquare[]
  console.log(
    'Grid squares:',
    gridSquares,
    typeof gridSquares,
    gridSquares.length
  )
  const { sessid, dcgid } = useParams()

  const res = (
    <div className="rootContainer">
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
            Grid Squares
          </Typography>
        </Box>
        <Box
          sx={{
            mt: '1em',
            ml: '1em',
            width: '95%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {gridSquares && gridSquares.length > 0 ? (
            gridSquares.map((gs) => GridSquareCard(gs, sessid, dcgid))
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </div>
  )
  return res
}
