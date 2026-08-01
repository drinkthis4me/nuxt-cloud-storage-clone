declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    name: string | null
  }

  interface UserSession {
    user: User
    loggedInAt: Date
  }

  // interface SecureSessionData {
  // }
}

export {}
