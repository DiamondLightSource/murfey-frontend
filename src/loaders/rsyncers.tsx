import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'

export const getRsyncerData = async (sessionId: string) => {
  const response = await client.get(
    `instrument_server/instruments/${sessionStorage.getItem('instrumentName')}/sessions/${sessionId}/rsyncer_info`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const requestSymlinkCreation = async (
  sessionId: number,
  destination: string,
  symlinkPath: string,
  symlinkOverride: boolean
) => {
  const response = await client.post(`sessions/${sessionId}/symlink`, {
    target: destination,
    symlink: symlinkPath,
    override: symlinkOverride,
  })

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

export const rsyncerLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const sessionId = params.sessid
    if (!sessionId) return null

    // Construct the queryKey and queryFn
    const queryKey = ['rsyncers', sessionId]
    const queryFn = () => getRsyncerData(sessionId)
    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }

    return queryClient.ensureQueryData(singleQuery)
  }
