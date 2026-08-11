const EXTENSION_MAP: Record<string, string> = {
  // Documents
  'pdf': 'vscode-icons:file-type-pdf2',
  'doc': 'vscode-icons:file-type-word',
  'docx': 'vscode-icons:file-type-word',
  'xls': 'vscode-icons:file-type-excel',
  'xlsx': 'vscode-icons:file-type-excel',
  'json': 'vscode-icons:file-type-json',
  'txt': 'i-vscode-icons-file-type-text',
  'md': 'i-vscode-icons-file-type-markdown',
  'ppt': 'i-vscode-icons-file-type-powerpoint',
  'pptx': 'i-vscode-icons-file-type-powerpoint',

  // Compressed
  'zip': 'vscode-icons:file-type-zip',
  '7z': 'vscode-icons:file-type-zip',
  'jar': 'vscode-icons:file-type-zip',
  'rar': 'vscode-icons:file-type-zip',

  // Programming
  'html': 'vscode-icons:file-type-html',
  'xml': 'vscode-icons:file-type-xml',
  'js': 'vscode-icons:file-type-js-official',
  'ts': 'vscode-icons:file-type-typescript-official',
  'vue': 'vscode-icons:file-type-vue',
}

export function getFileIcon(file: { name: string, isFolder: boolean, mimeType: string }) {
  if (file.isFolder) return 'vscode-icons:default-folder'

  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext && EXTENSION_MAP[ext]) return EXTENSION_MAP[ext]

  // fall back to mimeType category
  if (file.mimeType.startsWith('image/')) return 'vscode-icons:file-type-image'
  if (file.mimeType.startsWith('video/')) return 'vscode-icons:file-type-video'
  if (file.mimeType.startsWith('audio/')) return 'vscode-icons:file-type-audio'

  return 'vscode-icons:default-file'
}
