export interface CheckAnswer {
  userId: string
  dateTime: string
  imSafeAnswer: ImSafeAnswer
  weatherAnswer: WeatherAnswer
  judgement: string
}

export interface ImSafeAnswer {
  illness: number
  medication: number
  stress: number
  alcohol: number
  fatigue: number
  emotion: number
}

export interface WeatherAnswer {
  wetRoad: number
  visibility: number
  icyRoad: number
  snow: number
}
