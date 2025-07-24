import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'

const getGainRefData = async (sessionId: string) => {
  const response = await client.get(
    `instrument_server/instruments/${sessionStorage.getItem('instrumentName')}/sessions/${sessionId}/possible_gain_references`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const transferGainReference = async (
  sessionId: number,
  gainRef: string
) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/upload_gain_reference`,
    {
      gain_path: gainRef,
    }
  )
  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const prepareGainReference = async (
  sessionId: number,
  gainRef: string,
  rescale: boolean = false,
  eer: boolean = false,
  tag: string = ''
) => {
  const response = await client.post(
    `file_io/frontend/sessions/${sessionId}/process_gain`,
    {
      gain_ref: gainRef,
      rescale: rescale,
      eer: eer,
      tag: tag,
    }
  )
  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const updateCurrentGainReference = async (
  sessionId: number,
  gainRef: string
) => {
  const response = await client.put(
    `session_info/sessions/${sessionId}/current_gain_ref`,
    {
      path: gainRef,
    }
  )
  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const gainRefLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const sessionId = params.sessid
    if (!sessionId) return null

    const queryKey = ['gainRefs', sessionId]
    const queryFn = () => getGainRefData(sessionId)

    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }
    return queryClient.ensureQueryData(singleQuery)
  }
