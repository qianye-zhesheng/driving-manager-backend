import { z } from 'zod/v4'

const ImSafeAnswer = z.object({
  illness: z.number(),
  medication: z.number(),
  stress: z.number(),
  alcohol: z.number(),
  fatigue: z.number(),
  emotion: z.number(),
})

const WeatherAnswer = z.object({
  wetRoad: z.number(),
  visibility: z.number(),
  icyRoad: z.number(),
  snow: z.number(),
})

export const AnswerParam = z.object({
  userId: z.string(),
  imSafeAnswer: ImSafeAnswer,
  weatherAnswer: WeatherAnswer,
  judgement: z.string(),
})

export type ImSafeAnswer = z.infer<typeof ImSafeAnswer>
export type WeatherAnswer = z.infer<typeof WeatherAnswer>
export type AnswerParam = z.infer<typeof AnswerParam>
