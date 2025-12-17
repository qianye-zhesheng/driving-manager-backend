export interface CurrentInfo {
  todaysCheck?: CheckResult
  activeSession?: DrivingSession
}

export interface CheckResult {
  readonly checkedAt: string
  readonly judgement: string
}

export interface DrivingSession {
  readonly date: string
  readonly startOdometer: number
}

export class CurrentInfoFactory {
  public static create(
    todaysCheck: CheckResult | null,
    activeSession: DrivingSession | null,
  ): CurrentInfo {
    const currentInfo: CurrentInfo = {}

    if (todaysCheck !== null) {
      currentInfo.todaysCheck = todaysCheck
    }

    if (activeSession !== null) {
      currentInfo.activeSession = activeSession
    }

    return currentInfo
  }
}
