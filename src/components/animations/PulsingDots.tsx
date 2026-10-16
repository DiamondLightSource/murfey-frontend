import { Box, type BoxProps } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

type PulsingDotsProps = {
  dotSize?: BoxProps['w']
}

export const PulsingDots = ({ dotSize = 2 }: PulsingDotsProps) => {
  // Show three plusing dots. Used to indicate when a component is loading
  const bounce = keyframes`
    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
    40% { transform: scale(1); opacity: 1; }
  `
  return (
    <Box display="flex" gap={1}>
      {[0.1, 0.2, 0.3].map((delay) => (
        <Box
          w={dotSize}
          h={dotSize}
          bg="black"
          borderRadius="full"
          sx={{
            animation: `${bounce} 1s infinite ease-in-out`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </Box>
  )
}
