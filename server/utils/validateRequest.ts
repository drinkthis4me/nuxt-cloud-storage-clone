import { BAD_REQUEST } from '#server/utils/httpStatus'
import { z } from 'zod'

import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

type ValidateFn = typeof getValidatedRouterParams | typeof readValidatedBody | typeof getValidatedQuery

export async function validateRequest<
  T extends ZodType,
>(event: H3Event, validateFn: ValidateFn, schema: T): Promise<z.infer<T>> {
  const parsed = await validateFn(event, params => schema.safeParse(params))

  if (!parsed.success) {
    throw createError({
      ...BAD_REQUEST,
      message: 'Validation Error',
      data: z.flattenError(parsed.error),
    })
  }

  return parsed.data
}
