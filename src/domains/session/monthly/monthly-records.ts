export interface SessionRecord {
  readonly operationDate: string
  readonly startOdometer: number
  readonly endOdometer: number
  readonly finished: boolean
  readonly officialDistance: number
  readonly privateDistance: number
}

export interface Summary {
  readonly year: number
  readonly month: number
  readonly totalOfficialDistance: number
  readonly totalPrivateDistance: number
  readonly officialPercentage: number
  readonly privatePercentage: number
}

export interface MonthlyRecords {
  readonly summary: Summary
  readonly records: SessionRecord[]
}
