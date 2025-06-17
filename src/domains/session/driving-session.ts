export interface DrivingSession {
  userId: string
  date: string
  finished: boolean
  startOdometer: number
  endOdometer?: number
  businessDistance?: number
}
