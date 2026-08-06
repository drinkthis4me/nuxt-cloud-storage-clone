export const BAD_REQUEST = {
  status: 400,
  statusText: 'Bad Request',
  message: 'Bad Request',
} as const

export const UNAUTHORIZED = {
  status: 401,
  statusText: 'Unauthorized',
  message: 'Unauthorized',
} as const

export const FORBIDDEN = {
  status: 403,
  statusText: 'Forbidden',
  message: 'Forbidden',
} as const

export const NOT_FOUND = {
  status: 404,
  statusText: 'Not Found',
  message: 'Not Found',
} as const

export const CONFLICT = {
  status: 409,
  statusText: 'Conflict',
  message: 'Conflict',
} as const

export const UNPROCESSABLE_CONTENT = {
  status: 422,
  statusText: 'Unprocessable Content',
  message: 'Unprocessable Content',
} as const

export const INTERNAL_SERVER_ERROR = {
  status: 500,
  statusText: 'Internal Server Error',
  message: 'Internal Server Error',
} as const

export const HTTP_STATUS = {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  CONFLICT,
  UNPROCESSABLE_CONTENT,
  INTERNAL_SERVER_ERROR,
} as const
