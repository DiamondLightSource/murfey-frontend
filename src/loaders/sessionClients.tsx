import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'
import { convertUTCToUKNaive, convertUKNaiveToUTC } from 'utils/generic'

export const includePage = (endpoint: string, limit: number, page: number) =>
  `${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page - 1}&limit=${limit}`

const getAllSessionsData = async () => {
  if (!sessionStorage.getItem('instrumentName')) return null
  const response = await client.get(
    `session_info/instruments/${sessionStorage.getItem('instrumentName')}/sessions`
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
  const response = await client.get(`session_info/session/${sessid}`)

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

export const linkSessionToClient = async (
  client_id: number,
  sessionName: string
) => {
  const response = await client.post(
    `session_info/clients/${client_id}/session`,
    {
      session_name: sessionName,
    }
  )
  if (response.status !== 200) return null
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
    `session_info/instruments/${instrumentName}/visits/${visit}/session/${sessionName}`,
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

  // Skip loading logic if no instrument name was found
  if (!instrumentName) return null

  const queryKey = ['homepageSessions', instrumentName]
  const queryFn = async () => {
    if (!instrumentName) return null
    const data = await getAllSessionsData()
    if (!data) return null
    return data
  }

  await queryClient.invalidateQueries({ queryKey })
  return await queryClient.fetchQuery({ queryKey, queryFn })
}

export const sessionLoader =
  (queryClient: QueryClient) => async (params: Params) => {
    const sessid = params.sessid
    if (!sessid) return null

    const queryBuilder = (sessid: string = '0') => {
      return {
        queryKey: ['sessionId', sessid],
        queryFn: () => getSessionData(sessid),
      }
    }
    const singleQuery = queryBuilder(params.sessid)
    const queryKey = singleQuery.queryKey

    await queryClient.invalidateQueries({ queryKey })
    return await queryClient.fetchQuery(singleQuery)
  }
