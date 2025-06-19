import { DrivingSession } from '../driving-session'
import { ValidationResult } from '../validation-result'
import { FindResult } from './find-result'
import { StartSessionRepository } from './start-session-repository'

export class StartSessionValidator {
  public constructor(
    private readonly repository: StartSessionRepository,
    private readonly drivingSession: DrivingSession,
  ) {}

  public async validate(): Promise<ValidationResult> {
    const userId: string = this.drivingSession.userId
    const dateNumber: number = this.drivingSession.dateNumber

    if (await this.repository.existUnfinishedSessions(userId, dateNumber)) {
      return ValidationResult.invalid('終了していない運行記録を先に終了させてください')
    }

    const previousSession: FindResult = await this.repository.findPreviousSessionIfExists(
      userId,
      dateNumber,
    )

    if (previousSession.doesNotExist()) {
      return ValidationResult.valid()
    }

    if (this.hasSmallerStartThan(previousSession.get())) {
      return ValidationResult.invalid(
        '開始メーター値は、前回の終了メーター値よりも大きい値を指定してください',
      )
    }

    return ValidationResult.valid()
  }

  private hasSmallerStartThan(previousSession: DrivingSession): boolean {
    return this.drivingSession.startOdometer < previousSession.endOdometer
  }
}
