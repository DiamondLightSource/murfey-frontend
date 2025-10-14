const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const parseDate = (dateString: string | undefined) => {
  const safeDate = dateString ?? ''
  const date = Date.parse(safeDate)

  if (isNaN(date)) {
    return safeDate
  }

  return timeFormatter.format(date)
}

export const convertUKNaiveToUTC = (naiveIsoString: string): string => {
  // One of our databases stores timestamps naively, so this function helps convert it
  // correctly into the correct UTC time, taking into account GMT/BST.
  // The time is returned in the ISO 8601 format 'YYYY-MM-DDTHH:mm:ssZ'.

  const timeZone = 'Europe/London'

  // Break down naive date parts
  const [Y, M, D, h, m, s] = naiveIsoString.split(/[-T:]/).map(Number)
  const ukDate = new Date(Date.UTC(Y, M - 1, D, h, m, s))

  // Format the UK-local version of this date to find the offset
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    timeZoneName: 'shortOffset', // fallback to 'longOffset' if needed
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // Find the timezone at this current date and time
  const parts = formatter.formatToParts(ukDate)
  const offsetPart = parts.find((p) => p.type === 'timeZoneName')
  const offsetText = offsetPart?.value || ''

  // Calculate the offset
  const match = offsetText.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/)
  const offsetHours = match ? parseInt(match[1]) : 0
  const offsetMinutes = match?.[2] ? parseInt(match[2]) : 0
  const totalOffsetMs = (offsetHours * 60 + offsetMinutes) * 60 * 1000

  // Adjust the UTC time to reflect this
  const utcDate = new Date(ukDate.getTime() - totalOffsetMs)
  return utcDate.toISOString()
}

export const convertUTCToUKNaive = (utcIsoString: string): string => {
  // Converts the app's internal UTC timestamp into a naive string that shows the
  // equivalent UK timestamp, allowing it to be invariant across timezones.
  // The time is returned in the format 'YYYY-MM-DDTHH:mm:ss', with no time zone
  // information
  const timeZone = 'Europe/London'
  const date = new Date(utcIsoString)

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)

  const getPart = (type: string) => {
    const part = parts.find((p) => p.type === type)
    return part?.value.padStart(2, '0') || '00'
  }
  const naiveUK =
    [getPart('year'), getPart('month'), getPart('day')].join('-') +
    'T' +
    [getPart('hour'), getPart('minute'), getPart('second')].join(':')

  return naiveUK
}

export const formatUTCISOToUKLocal = (utcIsoString: string) => {
  // Formats the UTC time to its UK equivalent as a human-readable string
  const date = new Date(utcIsoString)
  return date.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  })
}
