import { DrivingSession } from '../driving-session'
import { Response } from '../response'
import { FindResult } from './find-result'
import { StartSessionRepository } from './start-session-repository'

export class StartSessionSaver {
  public constructor(
    private readonly repository: StartSessionRepository,
    private readonly drivingSession: DrivingSession,
  ) {}

  public async save(): Promise<Response> {
    const userId: string = this.drivingSession.userId
    const dateNumber: number = this.drivingSession.dateNumber

    try {
      if (await this.repository.existUnfinishedSessions(userId, dateNumber)) {
        return Response.of409('終了していない運行記録を先に終了させてください')
      }

      const previousSession: FindResult = await this.repository.findPreviousSessionIfExists(
        userId,
        dateNumber,
      )

      if (previousSession.exists()) {
        if (this.drivingSession.startOdometer < previousSession.get().endOdometer) {
          return Response.of409(
            '開始メーター値は、前回の終了メーター値よりも大きい値を指定してください',
          )
        }
      }

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
      console.log('Error when saving start driging session:', error.stack)
      return Response.of500(error.message)
    }
  }
}
