import { z } from 'zod'
import { BAD_REQUEST } from '#server/utils/httpStatus'

import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

export const getValidatedRouterParamsWithSchema = async <
  T extends ZodType,
> (event: H3Event, schema: T): Promise<z.infer<T>> => {
  const parsed = await getValidatedRouterParams(event, params => schema.safeParse(params))

  if (!parsed.success) {
    throw createError({
      ...BAD_REQUEST,
      message: 'Validation Error',
      data: z.flattenError(parsed.error),
    })
  }

  return parsed.data
}
