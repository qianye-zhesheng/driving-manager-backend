import { DrivingSession } from '../driving-session'
import { ValidationResult } from '../validation-result'

export class StartSessionUpdateValidator {
  public constructor(
    private readonly newDrivingSession: DrivingSession,
    private readonly existingDrivingSession: DrivingSession,
  ) {}

  public validate(): ValidationResult {
    if (this.sessionHasNotFinished()) {
      //まだ運行が終了していないなら、開始終了の異常値チェック不要
      return ValidationResult.valid()
    }

    if (this.hasSmarlerEndThanStart()) {
      return ValidationResult.invalid(
        '開始メーター値は、終了メーター値よりも小さい値を指定してください',
      )
    }

    return ValidationResult.valid()
  }

  private sessionHasNotFinished(): boolean {
    return !this.existingDrivingSession.finished
  }

  private hasSmarlerEndThanStart(): boolean {
    return this.existingDrivingSession.endOdometer < this.newDrivingSession.startOdometer
  }
}
