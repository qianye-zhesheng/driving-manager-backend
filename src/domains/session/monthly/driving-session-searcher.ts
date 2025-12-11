import { DistanceCalculator } from './distance-calculator'
import { MonthlySessionsRepository } from './monthly-sessions-repository'
import { YearMonthQuery } from './year-month-query'

export class DrivingSessionSearcher {
  constructor(
    private readonly repository: MonthlySessionsRepository,
    private readonly userId: string,
    private readonly yearMonth: YearMonthQuery,
  ) {}

  public async search(): Promise<DistanceCalculator> {
    const drivingSessions = await this.repository.searchSessionsByYearMonth(
      this.userId,
      this.yearMonth,
    )
    const prevMonthLastSession = await this.repository.findPreviousMonthLatestSessionIfExists(
      this.userId,
      this.yearMonth,
    )

    return new DistanceCalculator(drivingSessions, prevMonthLastSession, this.yearMonth)
  }
}
