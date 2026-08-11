import type { FetchError } from 'ofetch'

export function getRequestErrorMessage(
  err: unknown,
  defaultMessage: string = 'Something went wrong',
): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const fetchErr = err as FetchError
    const message = fetchErr.data?.message
    if (typeof message === 'string') {
      return message
    }
  }

  return defaultMessage
}
