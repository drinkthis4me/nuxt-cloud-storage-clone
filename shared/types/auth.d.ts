import type { UserModel } from '~~/prisma/generated/models'

export type User = Pick<UserModel, 'id' | 'email' | 'name'>

declare module '#auth-utils' {

  interface UserSession {
    user: User
    loggedInAt: Date
  }

  // interface SecureSessionData {
  // }
}

export {}

export interface LoginResponse {
  success: true
  user: User
}
