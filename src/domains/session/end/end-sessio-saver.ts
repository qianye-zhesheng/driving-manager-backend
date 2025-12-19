import { DateNumber } from '../date-number'
import { DrivingSession } from '../driving-session'
import { Response } from '../response'
import { SessionParam } from '../session-param'
import { ValidationResult } from '../validation-result'
import { EndSessionRepository } from './end-session-repository'
import { EndSessionValidator } from './end-session-validator'
import { FindResult } from './find-result'

export class EndSessionSaver {
  private readonly repository: EndSessionRepository
  private readonly userId: string
  private readonly dateNumber: number
  private readonly operationDate: string
  private readonly endOdometer: number

  public constructor(repository: EndSessionRepository, sessionParam: SessionParam, userId: string) {
    this.repository = repository
    this.userId = userId
    this.dateNumber = DateNumber.of(sessionParam.date).get()
    this.operationDate = sessionParam.date
    this.endOdometer = sessionParam.odometer
  }

  public async save(): Promise<Response> {
    let validationResult: ValidationResult

    try {
      validationResult = await new EndSessionValidator(
        this.repository,
        this.userId,
        this.dateNumber,
        this.endOdometer,
      ).validate()
    } catch (error) {
      return this.reportError('validating start session', error)
    }

    if (validationResult.isInvalid()) {
      return Response.of409(validationResult.getErrorMessage())
    }

    try {
      const existingDrivingSession: FindResult = await this.repository.findSameDateSessionIfExists(
        this.userId,
        this.dateNumber,
      )

      const drivingSession: DrivingSession = {
        userId: this.userId,
        dateNumber: this.dateNumber,
        operationDate: this.operationDate,
        finished: true,
        startOdometer: existingDrivingSession.get().startOdometer,
        endOdometer: this.endOdometer,
      }

      await this.repository.update(drivingSession, existingDrivingSession.get())

      return Response.of200(drivingSession)
    } catch (error) {
      return this.reportError('saving driving session', error)
    }
  }

  private reportError(location: string, error: Error): Response {
    console.log(`Error when ${location}:`, error.stack)
    return Response.of500(error.message)
  }
}
