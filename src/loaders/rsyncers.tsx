import { QueryClient } from '@tanstack/react-query'
import { client } from 'utils/api/client'
import { Params } from 'react-router-dom'

export const getRsyncerData = async (sessionId: string) => {
  const response = await client.get(
    `instrument_server/instruments/${sessionStorage.getItem('instrumentName')}/sessions/${sessionId}/rsyncer_info`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const pauseRsyncer = async (sessionId: number, source: string) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/stop_rsyncer`,
    {
      source: source,
    }
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const restartRsyncer = async (sessionId: number, source: string) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/restart_rsyncer`,
    {
      source: source,
    }
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const finaliseRsyncer = async (sessionId: number, source: string) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/finalise_rsyncer`,
    {
      source: source,
    }
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const finaliseSession = async (sessionId: number) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/finalise_session`,
    {}
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const removeRsyncer = async (sessionId: number, source: string) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/remove_rsyncer`,
    {
      source: source,
    }
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const flushSkippedRsyncer = async (
  sessionId: number,
  source: string
) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/flush_skipped_rsyncer`,
    {
      source: source,
    }
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

const queryBuilder = (sessionId: string = '0') => {
  return {
    queryKey: ['sessid', sessionId],
    queryFn: () => getRsyncerData(sessionId),
    staleTime: 60000,
  }
}

export const rsyncerLoader =
  (queryClient: QueryClient) => async (params: Params) => {
    const singleQuery = queryBuilder(params.sessid)
    return (
      (await queryClient.getQueryData(singleQuery.queryKey)) ??
      (await queryClient.fetchQuery(singleQuery))
    )
  }
