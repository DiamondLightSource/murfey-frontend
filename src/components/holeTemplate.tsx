import { Drag, raise } from '@visx/drag'
import { LinearGradient } from '@visx/gradient'
import { scaleOrdinal } from '@visx/scale'
import React, { useMemo, useState, useEffect } from 'react'

export type HoleTemplateProps = {
  width: number
  height: number
}

export type Circle = {
  radius: number
  x: number
  y: number
  id: string
}

export default function HoleTemplate({ width, height }: HoleTemplateProps) {
  const [draggingItems, setDraggingItems] = useState<Circle[]>([
    { radius: width / 6, x: wdith / 2, y: width / 2, id: 'hole' } as Circle,
  ])

  if (draggingItems.length === 0 || width < 10) return null

  return (
    <div className="Drag" style={{ touchAction: 'none' }}>
      <svg width={width} height={height}>
        <rect fill="#c4c3cb" width={width} height={height} rx={14} />

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
              <circle
                key={`dot-${d.id}`}
                cx={x}
                cy={y}
                r={isDragging ? d.radius + 4 : d.radius}
                transform={`translate(${dx}, ${dy})`}
                fillOpacity={0.9}
                stroke={isDragging ? 'white' : 'transparent'}
                strokeWidth={2}
                onMouseMove={dragMove}
                onMouseUp={dragEnd}
                onMouseDown={dragStart}
                onTouchStart={dragStart}
                onTouchMove={dragMove}
                onTouchEnd={dragEnd}
              />
            )}
          </Drag>
        ))}
      </svg>
    </div>
  )
}
