import { DrivingSession } from '../driving-session'
import { ValidationResult } from '../validation-result'
import { FindResult } from './find-result'
import { EndSessionRepository } from './end-session-repository'

export class EndSessionValidator {
  public constructor(
    private readonly repository: EndSessionRepository,
    private readonly userId: string,
    private readonly dateNumber: number,
    private readonly endOdometer: number,
  ) {}

  public async validate(): Promise<ValidationResult> {
    const sameDateSession: FindResult = await this.repository.findSameDateSessionIfExists(
      this.userId,
      this.dateNumber,
    )

    if (sameDateSession.doesNotExist()) {
      return ValidationResult.invalid('先に運行を開始してください')
    }

    if (this.hasSmallerEndThanStartOf(sameDateSession.get())) {
      return ValidationResult.invalid(
        '終了メーター値は、開始メーター値よりも大きい値を指定してください',
      )
    }

    const nextSession: FindResult = await this.repository.findNextSessionIfExists(
      this.userId,
      this.dateNumber,
    )

    if (nextSession.doesNotExist()) {
      return ValidationResult.valid()
    }

    if (this.hasLargerEndThanStartOf(nextSession.get())) {
      return ValidationResult.invalid(
        '終了メーター値は、次回の開始メーター値よりも小さい値を指定してください',
      )
    }

    return ValidationResult.valid()
  }

  private hasLargerEndThanStartOf(nextSession: DrivingSession): boolean {
    return this.endOdometer > nextSession.startOdometer
  }

  private hasSmallerEndThanStartOf(sameDateSession: DrivingSession): boolean {
    return this.endOdometer < sameDateSession.startOdometer
  }
}
