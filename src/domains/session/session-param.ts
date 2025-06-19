import { z } from 'zod/v4'

export const SessionParam = z.object({
  userId: z.string(),
  date: z.iso.date(),
  odometer: z.int().positive(),
})

export type SessionParam = z.infer<typeof SessionParam>
