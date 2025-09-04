import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'
import { convertUTCToUKNaive, convertUKNaiveToUTC } from 'utils/generic'

export const includePage = (endpoint: string, limit: number, page: number) =>
  `${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page - 1}&limit=${limit}`

export const getAllSessionsData = async (instrumentName: string) => {
  if (!instrumentName) return null
  const response = await client.get(
    `session_info/instruments/${instrumentName}/sessions`
  )
  if (response.status !== 200) return null
  return {
    current: response.data,
  }
}

export const getSessionDataForVisit = async (
  visit: string,
  instrumentName: string
) => {
  if (visit === '' || instrumentName === '') return []
  const response = await client.get(
    `session_info/instruments/${instrumentName}/visits/${visit}/sessions`
  )
  if (response.status !== 200) return []
  return response.data
}

export const getSessionData = async (sessid: string = '0') => {
  const response = await client.get(`session_info/sessions/${sessid}`)

  if (response.status !== 200) return null
  // Convert naive times into UTC, if set
  if (!response.data.session.visit_end_time) return response.data
  response.data = {
    ...response.data,
    session: {
      ...response.data.session,
      visit_end_time: convertUKNaiveToUTC(response.data.session.visit_end_time),
    },
  }
  return response.data
}

export const createSession = async (
  visit: string,
  sessionName: string,
  instrumentName: string,
  sessionEndTime: Date | null
) => {
  const ukEndTime = sessionEndTime
    ? convertUTCToUKNaive(sessionEndTime.toISOString())
    : null
  const response = await client.post(
    `session_info/instruments/${instrumentName}/visits/${visit}/sessions/${sessionName}`,
    { end_time: ukEndTime }
  )
  if (response.status !== 200) return null
  return response.data
}

export const updateSession = async (
  sessionID: number,
  process: boolean = true
) => {
  const response = await client.post(
    `session_info/sessions/${sessionID}?process=${process ? 'true' : 'false'}`,
    {}
  )
  if (response.status !== 200) return null
  return response.data
}

export const updateVisitEndTime = async (
  sessionID: number,
  sessionEndTime: Date
) => {
  const ukEndTime = convertUTCToUKNaive(sessionEndTime.toISOString())
  const response = await client.post(
    `instrument_server/sessions/${sessionID}/multigrid_controller/visit_end_time?end_time=${ukEndTime}`,
    {}
  )
  if (response.status !== 200) return null
  return response.data
}

export const deleteSessionData = async (sessid: number) => {
  const response = await client.delete(`session_info/sessions/${sessid}`)
  if (response.status !== 200) return null
  return response.data
}

export const allSessionsLoader = (queryClient: QueryClient) => async () => {
  // Load the instrument name from sessionStorage
  const instrumentName = sessionStorage.getItem('instrumentName')
  if (!instrumentName) return null

  // Construct the query key and query function
  const queryKey = ['homepageSessions', instrumentName]
  const queryFn = () => getAllSessionsData(instrumentName)
  const singleQuery = {
    queryKey: queryKey,
    queryFn: queryFn,
    staleTime: 60000,
  }

  return queryClient.ensureQueryData(singleQuery)
}

export const sessionLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const sessionId = params.sessid
    if (!sessionId) return null
    const queryKey = ['sessionInfo', sessionId]
    const queryFn = () => getSessionData(sessionId)
    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }

    return queryClient.ensureQueryData(singleQuery)
  }
