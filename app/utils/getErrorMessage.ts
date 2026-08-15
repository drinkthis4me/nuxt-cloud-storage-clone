import type { FetchError } from 'ofetch'

export function getErrorMessage(
  err: unknown,
  defaultMessage = 'An unexpected error occurred.',
): string {
  if (typeof err === 'string') {
    return err
  }

  const fetchError = err as FetchError
  if (fetchError?.data) {
    if (typeof fetchError.data === 'object' && fetchError.data !== null) {
      const data = fetchError.data as { message?: string, error?: string }
      if (data.message) return data.message
      if (data.error) return data.error
    }
    if (typeof fetchError.data === 'string') {
      return fetchError.data
    }
  }
  if (fetchError?.statusMessage) {
    return fetchError.statusMessage
  }

  if (err instanceof Error) {
    return err.message
  }

  return defaultMessage
}
