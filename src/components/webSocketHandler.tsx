import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { v4 as uuid4 } from 'uuid'

export const WebSocketHandler = () => {
  // Create states
  const [uuid, setUUID] = useState('')
  const queryClient = useQueryClient()

  // Set up a websocket connection that persists across all protected routes
  const baseURL =
    sessionStorage.getItem('murfeyServerURL') ??
    process.env.REACT_APP_API_ENDPOINT
  const wsURL = baseURL ? baseURL.replace('http', 'ws') : 'ws://localhost:8000'

  // Helper function to parse websocket messages
  const parseWebsocketMessage = (message: any) => {
    let parsedMessage: any = {}
    try {
      parsedMessage = JSON.parse(message)
    } catch (err) {
      console.warn(`Invalid WebSocket message:`, message)
      return
    }

    // Actions to take depending on the type of message received
    if (parsedMessage.message === 'refresh') {
      // Update session ID queries when a change to the RSyncer is detected
      if (parsedMessage.target === 'rsyncer') {
        let sessionID: string | null = parsedMessage.session_id
        if (!sessionID) return null
        console.log(
          `Received message to update rsyncer data for session`,
          sessionID
        )
        queryClient.refetchQueries({ queryKey: ['rsyncers', sessionID] })
      }
      // Update instrument name queries when a change to sessions is detected
      if (parsedMessage.target === 'sessions') {
        let instrumentName: string | null = parsedMessage.instrument_name
        if (!instrumentName) return null
        console.log(`Received message to re-fetch data for`, instrumentName)
        queryClient.refetchQueries({
          queryKey: ['homepageSessions', instrumentName],
        })
      }
    }
  }

  // Generate a UUID if missing
  useEffect(() => {
    if (!uuid) {
      setUUID(uuid4())
    }
  }, [uuid])

  // Establish a websocket connection
  useWebSocket(
    // 'null' is passed to 'useWebSocket()' if UUID is not set to prevent malformed connections
    uuid ? wsURL + `ws/connect/${uuid}` : null,
    uuid
      ? {
          onOpen: () => {
            console.log('WebSocket connection established.')
          },
          onClose: () => {
            console.log('WebSocket connection closed.')
          },
          onMessage: (event) => {
            parseWebsocketMessage(event.data)
          },
          shouldReconnect: () => true,
        }
      : undefined
  )

  return null // Nothing to render
}
