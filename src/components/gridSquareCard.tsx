import {
    CardBody,
    Card,
    CardHeader,
    Image,
    Text,
    Box,
    Tooltip,
    VStack,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
} from '@chakra-ui/react'

import { components } from 'schema/main'
import { getFoilHoles, getNumMovies } from 'loaders/gridSquares'

import { useState, useEffect } from 'react'
import { getUrlFromSessionStorage } from './getUrlFromSessionStorage'

type GridSquare = components['schemas']['GridSquare']
type FoilHole = components['schemas']['FoilHole']

const zip = (a: number[], b: number[]) => a.map((k, i) => [k, b[i]])

interface GridSquareCardProps {
    gs: GridSquare
    sessid: string | undefined
    dcgid: string | undefined
}

const GridSquareCard = ({ gs, sessid, dcgid }:
    GridSquareCardProps
) => {
    const [numFoilHoles, setNumFoilHoles] = useState(0)
    const [numMovies, setNumMovies] = useState(0)
    const [foilHoleXPositions, setFoilHoleXPositions] = useState<number[]>([])
    const [foilHoleYPositions, setFoilHoleYPositions] = useState<number[]>([])
    const [foilHoleNames, setFoilHoleNames] = useState<number[]>([])
    const [foilHoleImages, setFoilHoleImages] = useState<(string | null)[]>([])
    const [sliderValue, setSliderValue] = useState(10)

    // TODO ideally this is simplified
    const foilHoleSetup = (foilHoles: FoilHole[]) => {
        let xpositions: number[] = []
        let ypositions: number[] = []
        let names: number[] = []
        let images: (string | null)[] = []
        for (let i = 0; i < foilHoles.length; i++) {
            let x: number | undefined = foilHoles[i].x_location
            if (gs.thumbnail_size_x && gs.readout_area_x && x) {
                x = x * (gs.thumbnail_size_x / gs.readout_area_x)
            }
            let y = foilHoles[i].y_location
            if (gs.thumbnail_size_y && gs.readout_area_y && y) {
                y = y * (gs.thumbnail_size_y / gs.readout_area_y)
            }
            if (x) xpositions.push(Math.floor(x))
            if (y) ypositions.push(Math.floor(y))
            if (x) names.push(foilHoles[i].name)
            const image = foilHoles[i].image
            if (x) {
                images.push(image ?? null)
            }
        }
        setFoilHoleXPositions(xpositions)
        setFoilHoleYPositions(ypositions)
        setFoilHoleNames(names)
        setFoilHoleImages(images)
        setNumFoilHoles(foilHoles.length)
    }

    useEffect(() => {
        getFoilHoles(sessid ?? '0', dcgid ?? '0', gs.name).then((fhs) =>
            foilHoleSetup(fhs)
        )
        getNumMovies(sessid ?? '0', dcgid ?? '0', gs.name).then((nm) =>
            setNumMovies(nm)
        )
    }, [])


    const foilHoleTooltip = (fhName: number, fhImage: string | null) => {
        const fhImageUrl = getUrlFromSessionStorage(
            `display/sessions/${sessid}/data_collection_groups/${dcgid}/grid_squares/${gs.name}/foil_holes/${fhName}/image`
        )
        return (
            <VStack>
                <Text>{fhName}</Text>
                {fhImage ? <Image src={fhImageUrl} /> : <></>}
            </VStack>
        )
    }

    const imgUrl = getUrlFromSessionStorage(
        `display/sessions/${sessid}/data_collection_groups/${dcgid}/grid_squares/${gs.name}/image`
    )

    return (
        <Card align="center" display="flex">
            <CardHeader>{gs.name}</CardHeader>
            <CardBody>
                <Box position="relative" display="flex">
                    <Image
                        src={imgUrl}
                    />
                    <svg
                        width={gs.thumbnail_size_x}
                        height={gs.thumbnail_size_y}
                        style={{ position: 'absolute' }}
                    >
                        {zip(foilHoleXPositions, foilHoleYPositions).map(
                            (pos, index) => (
                                <Tooltip
                                    label={foilHoleTooltip(
                                        foilHoleNames[index],
                                        foilHoleImages[index]
                                    )}
                                >
                                    <circle
                                        cx={`${pos[0]}px`}
                                        cy={`${pos[1]}px`}
                                        r={`${sliderValue}px`}
                                        stroke="blue"
                                        stroke-width="2"
                                        fill="blue"
                                        opacity="0.3"
                                    />
                                </Tooltip>
                            )
                        )}
                    </svg>
                </Box>
                <Text align="center">{numFoilHoles} foil holes</Text>
                <Text align="center">{numMovies} movies</Text>
                <Slider
                    defaultValue={10}
                    min={5}
                    max={50}
                    onChange={(val) => setSliderValue(val)}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
            </CardBody>
        </Card>
    )
}

export { GridSquareCard }
