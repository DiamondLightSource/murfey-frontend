import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'

export const getSessionProcessingParameterData = async (
  sessid: string = '0'
) => {
  const response = await client.get(
    `session_parameters/sessions/${sessid}/session_processing_parameters`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const getProcessingParameterData = async (sessid: string = '0') => {
  const response = await client.get(
    `session_info/spa/sessions/${sessid}/spa_processing_parameters`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const updateSessionProcessingParameters = async (
  sessid: string,
  params: any = {}
) => {
  const response = await client.post(
    `session_parameters/sessions/${sessid}/session_processing_parameters`,
    {
      gain_ref: params['gainRef'] ?? '',
      dose_per_frame: params['dosePerFrame'] ?? null,
      eer_fractionation_file: params['eerFractionationFile'] ?? '',
      symmetry: params['symmetry'] ?? '',
      run_class3d:
        typeof params['run_class3d'] == 'boolean'
          ? params['run_class3d']
          : null,
    }
  )
  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const processingParametersLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const sessionId = params.sessid
    if (!sessionId) return null

    const queryKey = ['extraProcessingParameters', sessionId]
    const queryFn = () => getProcessingParameterData(sessionId)
    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }
    return queryClient.ensureQueryData(singleQuery)
  }

export const sessionParametersLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const sessionId = params.sessid
    if (!sessionId) return null

    const queryKey = ['processingParameters', sessionId]
    const queryFn = () => getSessionProcessingParameterData(sessionId)
    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }
    return queryClient.ensureQueryData(singleQuery)
  }
