export interface DrivingSession {
  userId: string
  operationDate: number
  finished: boolean
  startOdometer: number
  endOdometer?: number
  businessDistance?: number
}
