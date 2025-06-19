export interface DrivingSession {
  userId: string
  dateNumber: number
  operationDate: string
  finished: boolean
  startOdometer: number
  endOdometer?: number
}
