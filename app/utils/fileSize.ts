export function formatFileSize(fileSizeStr: string | null): string {
  if (!fileSizeStr) return 'N/A'

  try {
    const bytes = parseFloat(fileSizeStr)

    if (isNaN(bytes) || bytes < 0) {
      console.log('Invalid file size provided')
      return fileSizeStr
    }

    if (bytes === 0) {
      return '0 B'
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))

    const val = bytes / Math.pow(1024, i)

    const formattedSize = Number.isInteger(val) ? val.toString() : val.toFixed(2)

    return `${formattedSize} ${units[i]}`
  }
  catch (err) {
    console.log(err)
    return fileSizeStr
  }
}
