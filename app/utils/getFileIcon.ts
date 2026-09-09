const EXTENSION_MAP: Record<string, string> = {
  // Documents
  'pdf': 'i-vscode-icons-file-type-pdf2',
  'doc': 'i-vscode-icons-file-type-word',
  'docx': 'i-vscode-icons-file-type-word',
  'xls': 'i-vscode-icons-file-type-excel',
  'xlsx': 'i-vscode-icons-file-type-excel',
  'json': 'i-vscode-icons-file-type-json',
  'txt': 'i-vscode-icons-file-type-text',
  'md': 'i-vscode-icons-file-type-markdown',
  'ppt': 'i-vscode-icons-file-type-powerpoint',
  'pptx': 'i-vscode-icons-file-type-powerpoint',

  // Compressed
  'zip': 'i-vscode-icons-file-type-zip',
  '7z': 'i-vscode-icons-file-type-zip',
  'jar': 'i-vscode-icons-file-type-zip',
  'rar': 'i-vscode-icons-file-type-zip',

  // Programming
  'html': 'i-vscode-icons-file-type-html',
  'xml': 'i-vscode-icons-file-type-xml',
  'js': 'i-vscode-icons-file-type-js-official',
  'ts': 'i-vscode-icons-file-type-typescript-official',
  'vue': 'i-vscode-icons-file-type-vue',
}

export function getFileIcon(file: { name: string, isFolder: boolean, mimeType: string }) {
  if (file.isFolder) return 'i-vscode-icons-default-folder'

  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext && EXTENSION_MAP[ext]) return EXTENSION_MAP[ext]

  // fall back to mimeType category
  if (file.mimeType.startsWith('image/')) return 'i-vscode-icons-file-type-image'
  if (file.mimeType.startsWith('video/')) return 'i-vscode-icons-file-type-video'
  if (file.mimeType.startsWith('audio/')) return 'i-vscode-icons-file-type-audio'

  return 'i-vscode-icons-default-file'
}
