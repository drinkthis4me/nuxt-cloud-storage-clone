import type { UserModel } from '~~/prisma/generated/models'

declare module '#auth-utils' {
  interface User extends Pick<UserModel, 'id' | 'email' | 'name'> {}

  interface UserSession {
    user: User
    loggedInAt: Date
  }

  // interface SecureSessionData {
  // }
}

export {}

export interface AppUser {
  id: number
  email: string
  name: string | null
}

export interface LoginResponse {
  success: true
  user: AppUser
}
