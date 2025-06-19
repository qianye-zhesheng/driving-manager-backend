import { DrivingSession } from '../driving-session'
import { Response } from '../response'
import { ValidationResult } from '../validation-result'
import { FindResult } from './find-result'
import { StartSessionRepository } from './start-session-repository'
import { StartSessionValidator } from './start-session-validator'

export class StartSessionSaver {
  public constructor(
    private readonly repository: StartSessionRepository,
    private readonly drivingSession: DrivingSession,
  ) {}

  public async save(): Promise<Response> {
    const userId: string = this.drivingSession.userId
    const dateNumber: number = this.drivingSession.dateNumber

    let validationResult: ValidationResult

    try {
      validationResult = await new StartSessionValidator(
        this.repository,
        this.drivingSession,
      ).validate()
    } catch (error) {
      return this.reportError('validating start session', error)
    }

    if (validationResult.isInvalid) {
      return Response.of409(validationResult.getErrorMessage())
    }

    try {
      const sameDateSession: FindResult = await this.repository.findSameDateSessionIfExists(
        userId,
        dateNumber,
      )

      if (sameDateSession.exists()) {
        await this.repository.update(this.drivingSession, sameDateSession.get())
        return Response.of200(this.drivingSession)
      }

      await this.repository.create(this.drivingSession)
      return Response.of200(this.drivingSession)
    } catch (error) {
      return this.reportError('saving driving session', error)
    }
  }

  private reportError(location: string, error: Error): Response {
    console.log(`Error when ${location}:`, error.stack)
    return Response.of500(error.message)
  }
}
