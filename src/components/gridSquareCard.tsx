import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { getFoilHoles, getNumMovies } from 'loaders/gridSquares'
import { useCallback, useState, useEffect } from 'react'
import { components } from 'schema/main'

type GridSquare = components['schemas']['GridSquare']
type FoilHole = components['schemas']['FoilHole']

const getUrl = (endpoint: string) => {
  return (
    (sessionStorage.getItem('murfeyServerURL') ??
      process.env.REACT_APP_API_ENDPOINT) + endpoint
  )
}

const GridSquareCard = (
  gs: GridSquare,
  sessid: string | undefined,
  dcgid: string | undefined
) => {
  const [numFoilHoles, setNumFoilHoles] = useState(0)
  const [numMovies, setNumMovies] = useState(0)
  const [foilHoleXPositions, setFoilHoleXPositions] = useState<number[]>([])
  const [foilHoleYPositions, setFoilHoleYPositions] = useState<number[]>([])
  const [foilHoleNames, setFoilHoleNames] = useState<number[]>([])
  const [foilHoleImages, setFoilHoleImages] = useState<(string | null)[]>([])
  const [sliderValue, setSliderValue] = useState(10)
  const foilHoleSetup = useCallback(
    (foilHoles: FoilHole[]) => {
      let xpositions: number[] = []
      let ypositions = []
      let names: number[] = []
      let images: (string | null)[] = []
      for (let i = 0; i < foilHoles.length; i++) {
        const unscaledx = foilHoles[i].x_location
        const x =
          gs.thumbnail_size_x && gs.readout_area_x && unscaledx
            ? unscaledx * (gs.thumbnail_size_x / gs.readout_area_x)
            : unscaledx
        const unscaledy = foilHoles[i].y_location
        const y =
          gs.thumbnail_size_y && gs.readout_area_y && unscaledy
            ? unscaledy * (gs.thumbnail_size_y / gs.readout_area_y)
            : unscaledy
        if (x) xpositions.push(Math.floor(x))
        if (y) ypositions.push(Math.floor(y))
        if (x) names.push(foilHoles[i].name)
        const image = foilHoles[i].image
        if (x) image ? images.push(image) : images.push(null)
      }
      setFoilHoleXPositions(xpositions)
      setFoilHoleYPositions(ypositions)
      setFoilHoleNames(names)
      setFoilHoleImages(images)
      setNumFoilHoles(foilHoles.length)
    },
    [gs]
  )
  useEffect(() => {
    getFoilHoles(sessid ?? '0', dcgid ?? '0', gs.name).then((fhs) =>
      foilHoleSetup(fhs)
    )
    getNumMovies(sessid ?? '0', dcgid ?? '0', gs.name).then((nm) =>
      setNumMovies(nm)
    )
  }, [sessid, dcgid, gs, foilHoleSetup])

  const zip = (a: number[], b: number[]) => a.map((k, i) => [k, b[i]])

  const foilHoleTooltip = (fhName: number, fhImage: string | null) => {
    const fhImageUrl = getUrl(
      `display/sessions/${sessid}/data_collection_groups/${dcgid}/grid_squares/${gs.name}/foil_holes/${fhName}/image`
    )
    return (
      <Stack alignItems="center">
        <Typography>{fhName}</Typography>
        {fhImage ? <img src={fhImageUrl} alt={`Foil hole ${fhName}`} /> : <></>}
      </Stack>
    )
  }

  return (
    <Card
      sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
    >
      <CardHeader title={gs.name} />
      <CardContent>
        <Box position="relative" display="flex">
          <img
            src={getUrl(
              `display/sessions/${sessid}/data_collection_groups/${dcgid}/grid_squares/${gs.name}/image`
            )}
            alt={`Grid square ${gs.name}`}
          />
          <svg
            width={gs.thumbnail_size_x}
            height={gs.thumbnail_size_y}
            style={{ position: 'absolute' }}
          >
            {zip(foilHoleXPositions, foilHoleYPositions).map((pos, index) => (
              <Tooltip
                key={index}
                title={foilHoleTooltip(
                  foilHoleNames[index],
                  foilHoleImages[index]
                )}
              >
                <circle
                  cx={`${pos[0]}px`}
                  cy={`${pos[1]}px`}
                  r={`${sliderValue}px`}
                  stroke="blue"
                  strokeWidth="2"
                  fill="blue"
                  opacity="0.3"
                />
              </Tooltip>
            ))}
          </svg>
        </Box>
        <Typography align="center">{numFoilHoles} foil holes</Typography>
        <Typography align="center">{numMovies} movies</Typography>
        <Slider
          defaultValue={10}
          min={5}
          max={50}
          onChange={(_, val) => setSliderValue(val as number)}
        />
      </CardContent>
    </Card>
  )
}

export { GridSquareCard }
