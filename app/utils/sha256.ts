export async function sha256(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)

    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  catch (err) {
    console.error('[sha256] Failed to calculate file SHA-256 hash:', err)
    throw new Error('File hashing failed.', { cause: err })
  }
}
