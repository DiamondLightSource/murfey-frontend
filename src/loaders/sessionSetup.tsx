import { components } from 'schema/main'
import { client } from 'utils/api/client'

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
    // Return the response as-is; no need to turn it into a Boolean at this stage
    return response.data
  } catch (err) {
    console.error(err)
    return { exists: false }
  }
}
