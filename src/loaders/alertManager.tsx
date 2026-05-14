import { client } from 'utils/api/client'

type Matcher = {
  isEqual: string
  isRegex: string
  name: string
  value: string
}
type Status = {
  state: string
}

export type Silence = {
  id: string
  status: Status
  updatedAt: string
  comment: string
  createdBy: string
  endsAt: Date
  matchers: Matcher[]
  startsAt: string
}

export const createSilence = async (
  instrumentName: string,
  proposedEndTime: Date
) => {
  const response = await client.post(
    `session_info/silences/${instrumentName}?end_time=${proposedEndTime.toISOString()}`,
    {}
  )
  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const getSilences = async (instrumentName: string) => {
  const response = await client.get(`session_info/silences/${instrumentName}`) //should return active silences
  if (response.status !== 200) {
    return null
  }
  let silences: Silence[] = response.data
  return silences
}

export const getLongestSilence = async (instrumentName: string) => {
  const activeSilences: Silence[] | null = await getSilences(instrumentName)
  if (activeSilences === null || activeSilences.length === 0) return null
  const longestSilence = activeSilences.reduce((a, b) =>
    a.endsAt > b.endsAt ? a : b
  )
  return longestSilence
}

export const deleteSilence = async (instrumentName: string) => {
  const response = await client.delete(
    `session_info/silences/${instrumentName}`
  )
  if (response.status !== 200) {
    return null
  }
  return response.data
}
