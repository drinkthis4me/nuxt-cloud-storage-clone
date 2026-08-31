import { z } from 'zod'

const id = z.number()
export const email = z.string().trim().toLowerCase().pipe(z.email('Email is invalid'))
const password = z.string()
const name = z.string().trim()
const createdAt = z.coerce.date()
const isActive = z.boolean()

export const userDBSchema = z.object({
  id,
  email,
  password,
  name,
  createdAt,
  isActive,
})

export const userCreateSchema = z.object({
  email,
  password: password.min(8, 'Password must be at least 8 characters'),
  name: name.optional(),
})
export type UserCreateSchema = z.output<typeof userCreateSchema>

export const userLoginSchema = z.object({
  email,
  password: password.min(1, 'Password is required'),
})
export type UserLoginSchema = z.output<typeof userLoginSchema>
