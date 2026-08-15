import { getErrorMessage } from '~/utils/getErrorMessage'

export interface ShowErrorToastOption {
  error: unknown
  title?: string
  defaultDescription?: string
}

export function useErrorToast() {
  const toast = useToast()

  function showErrorToast(option: ShowErrorToastOption) {
    const {
      error,
      title = 'Error',
      defaultDescription = 'An unexpected error occurred.',
    } = option

    const errorMessage = getErrorMessage(error, defaultDescription)

    toast.add({
      color: 'error',
      title,
      description: errorMessage,
    })
  }

  return {
    showErrorToast,
  }
}
