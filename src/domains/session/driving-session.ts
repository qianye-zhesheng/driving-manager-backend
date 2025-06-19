export interface DrivingSession {
  userId: string
  dateKey: number
  operationDate: string
  finished: boolean
  startOdometer: number
  endOdometer?: number
}
