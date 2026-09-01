import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'

const getPossibleOTFDirs = async (sessionId: string) => {
  const response = await client.get(
    `instrument_server/instruments/${sessionStorage.getItem('instrumentName')}/sessions/${sessionId}/possible_otf_dirs`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const otfDirLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const sessionId = params.sessid
    if (!sessionId) return null

    const queryKey = ['gainRefs', sessionId]
    const queryFn = () => getPossibleOTFDirs(sessionId)

    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }
    return queryClient.ensureQueryData(singleQuery)
  }
