import { YearMonthQuery } from './year-month-query'
import { DrivingSession } from '../driving-session'
import { FindResult } from './find-result'
import { SummaryBuilder } from './summary-builder'
import { SessionRecord } from './monthly-records'

export class DistanceCalculator {
  constructor(
    private readonly drivingSessions: DrivingSession[],
    private readonly prevMonthLastSession: FindResult,
    private readonly yearMonth: YearMonthQuery,
  ) {}

  public calc(): SummaryBuilder {
    if (this.drivingSessions.length === 0) {
      return new SummaryBuilder([], this.yearMonth)
    }

    const sessionRecords: SessionRecord[] = this.drivingSessions.map((session, index) =>
      this.createSessionRecord(session, index),
    )

    return new SummaryBuilder(sessionRecords, this.yearMonth)
  }

  private createSessionRecord(session: DrivingSession, index: number): SessionRecord {
    const prevSession = this.getPreviousSession(index)
    const privateDistance = this.calculatePrivateDistance(session, prevSession)
    return this.toSessionRecord(session, privateDistance)
  }

  private getPreviousSession(index: number): DrivingSession | null {
    if (index !== 0) {
      return this.drivingSessions[index - 1]
    }
    return this.prevMonthLastSession.doesNotExist() ? null : this.prevMonthLastSession.get()
  }

  private calculatePrivateDistance(
    session: DrivingSession,
    prevSession: DrivingSession | null,
  ): number {
    if (prevSession == null || !prevSession.finished) {
      return 0
    }
    return session.startOdometer - prevSession.endOdometer
  }

  private toSessionRecord(drivingSession: DrivingSession, privateDistance: number): SessionRecord {
    return {
      operationDate: drivingSession.operationDate,
      startOdometer: drivingSession.startOdometer,
      endOdometer: drivingSession.endOdometer,
      finished: drivingSession.finished,
      officialDistance: drivingSession.finished
        ? drivingSession.endOdometer - drivingSession.startOdometer
        : 0,
      privateDistance: privateDistance,
    }
  }
}
