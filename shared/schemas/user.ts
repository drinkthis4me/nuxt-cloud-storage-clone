import { z } from 'zod'

const id = z.number()
const email = z.email('Email is invalid')
const password = z.string('Password is required')
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

export const userLoginSchema = z.object({
  email,
  password,
})
export type UserLoginSchema = z.output<typeof userLoginSchema>
