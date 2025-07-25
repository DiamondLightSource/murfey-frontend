import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'

const getDataCollectionGroups = async (sessid: string = '0') => {
  console.log(`Getting data collection groups`)
  const response = await client.get(
    `session_info/sessions/${sessid}/data_collection_groups`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const dataCollectionGroupsLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const sessionId = params.sessid
    if (!sessionId) return null

    const queryKey = ['dataCollectionGroups', sessionId]
    const queryFn = () => getDataCollectionGroups(sessionId)
    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }
    return (
      (await queryClient.getQueryData(singleQuery.queryKey)) ??
      (await queryClient.fetchQuery(singleQuery))
    )
  }
