import { DateFormatter, parseAbsolute, getLocalTimeZone } from '@internationalized/date'

const localTimeZone = getLocalTimeZone()

const formatter = new DateFormatter('en-US', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: localTimeZone,
})

export const isoToLocalDateTime = (isoString: string): string => {
  let res = ''

  try {
    const dateTime = parseAbsolute(isoString, localTimeZone)
    const jsDate = dateTime.toDate()
    res = formatter.format(jsDate)
  }
  catch (err) {
    console.log(err)
  }

  return res
}
