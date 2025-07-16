import { QueryClient } from '@tanstack/react-query'
import { client } from 'utils/api/client'
import { components } from 'schema/main'

type ProvidedProcessingParameters =
  components['schemas']['ProvidedProcessingParameters']

export const registerProcessingParameters = async (
  processingParameters: ProvidedProcessingParameters,
  sessionId: number
) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/provided_processing_parameters`,
    processingParameters
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

// Helper function to check whether a multigrid controller has been set up
export const checkMultigridControllerStatus = async (sessionId: string) => {
  try {
    const response = await client.get(
      `/instrument_server/sessions/${sessionId}/multigrid_controller/status`
    )
    console.log(`Multigrid controller status:`, response.data)
    return !!response.data.exists
  } catch (err) {
    console.error(err)
    return
  }
}
