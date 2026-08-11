export async function sha256(file: File): Promise<string> {
  let str = ''

  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)

    str = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  catch (err) {
    console.log(err)
  }

  return str
}
