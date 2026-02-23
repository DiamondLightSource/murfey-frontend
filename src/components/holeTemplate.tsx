import { Box, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react'
import { Drag, raise } from '@visx/drag'
import { LinearGradient } from '@visx/gradient'
import { scaleOrdinal } from '@visx/scale'
import React, { useState } from 'react'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'

export type HoleTemplateProps = {
  width: number
  height: number
}

export type Circle = {
  radius: number
  x: number
  y: number
  width: number
  height: number
  id: string
}

export const HoleTemplate = ({ width, height }: HoleTemplateProps) => {
  const [intensity, setIntensity] = useState(1)
  const [draggingItems, setDraggingItems] = useState<Circle[]>([
    { radius: width/8, x: width / 2, y: width / 2, id: 'center', width: 2*0.7*width/8, height: 0.6*2*0.7*width/8 } as Circle,
  ])

  const addPosition = () => {
    setDraggingItems([...draggingItems, { radius: width/8, x: width / 2, y: width / 2, id: 'center', width: 2*0.7*width/8, height: 0.6*2*0.7*width/8 } as Circle])
  }

  const removePosition = () => {
    if(draggingItems.length > 1) setDraggingItems(draggingItems.slice(0, -1))
  }

  if (draggingItems.length === 0 || width < 10) return null

  return (
    <div className="Drag" style={{ touchAction: 'none' }}>
      <Box
        w="100%"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
      <svg width={width} height={height}>
        <rect fill="#c4c3cb" width={width} height={height} rx={14} />
        <circle key={'hole'} cx={width/2} cy={width/2} r={width/3} strokeWidth={2} fill={'white'} />

        {draggingItems.map((d, i) => (
          <Drag
            key={`drag-${d.id}`}
            width={width}
            height={height}
            x={d.x}
            y={d.y}
            onDragStart={() => {
              // svg follows the painter model
              // so we need to move the data item
              // to end of the array for it to be drawn
              // "on top of" the other data items
              setDraggingItems(raise(draggingItems, i))
            }}
          >
            {({ dragStart, dragEnd, dragMove, isDragging, x, y, dx, dy }) => (
              <g>
              <circle
                key={`dot-${d.id}`}
                cx={x}
                cy={y}
                r={intensity*d.radius}
                transform={`translate(${dx}, ${dy})`}
                fillOpacity={0.5}
                stroke={isDragging ? 'white' : 'transparent'}
                strokeWidth={2}
                fill='#00A6A6'
                onMouseMove={dragMove}
                onMouseUp={dragEnd}
                onMouseDown={dragStart}
                onTouchStart={dragStart}
                onTouchMove={dragMove}
                onTouchEnd={dragEnd}
              />
              <rect
                key={`camera-${d.id}`}
                x={x-0.5*d.width}
                y={y-0.5*d.height}
                width={d.width}
                height={d.height}
                transform={`translate(${dx}, ${dy})`}
                fillOpacity={0.9}
                stroke={'transparent'}
                strokeWidth={2}
                fill='#00A6A6'
                onMouseMove={dragMove}
                onMouseUp={dragEnd}
                onMouseDown={dragStart}
                onTouchStart={dragStart}
                onTouchMove={dragMove}
                onTouchEnd={dragEnd}
              />
              </g>
            )}
          </Drag>
        ))}
      </svg>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
      <IconButton aria-label='add-position' icon={<AddIcon />} onClick={addPosition} />
      <IconButton aria-label='remove-position' icon={<MinusIcon />} onClick={removePosition} />
      </Box>
      <Slider aria-label='slider-intensity' defaultValue={100} min={0} max={300} step={1} onChange={(val) => setIntensity(val/100)}>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      </Box>
      </Box>
    </div>
  )
}
