import { QueryClient } from '@tanstack/react-query'
import { components } from 'schema/main'
import { client } from 'utils/api/client'

type MultigridWatcherSpec = components['schemas']['MultigridWatcherSetup']

export const setupMultigridWatcher = async (
  multigridWatcher: MultigridWatcherSpec,
  sessionId: number
) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/multigrid_watcher`,
    multigridWatcher
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const startMultigridWatcher = async (sessionId: number) => {
  const response = await client.post(
    `instrument_server/sessions/${sessionId}/start_multigrid_watcher`,
    {}
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}
