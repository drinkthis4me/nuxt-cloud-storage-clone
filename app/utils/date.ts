import { DateFormatter, parseAbsolute, getLocalTimeZone } from '@internationalized/date'

const localTimeZone = getLocalTimeZone()

const formatter = new DateFormatter('en-US', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: localTimeZone,
})

export function isoToLocalDateTime(isoString: string | null): string {
  if (isoString === null) return 'N/A'

  try {
    const dateTime = parseAbsolute(isoString, localTimeZone)
    const jsDate = dateTime.toDate()
    return formatter.format(jsDate)
  }
  catch (err) {
    console.log(err)

    return isoString
  }
}
