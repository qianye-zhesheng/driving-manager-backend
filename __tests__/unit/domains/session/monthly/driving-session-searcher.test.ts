import { DistanceCalculator } from '../../../../../src/domains/session/monthly/distance-calculator'
import { DrivingSessionSearcher } from '../../../../../src/domains/session/monthly/driving-session-searcher'
import { FindResult } from '../../../../../src/domains/session/monthly/find-result'
import { Month } from '../../../../../src/domains/session/monthly/month'
import { MonthlySessionsRepository } from '../../../../../src/domains/session/monthly/monthly-sessions-repository'
import { Year } from '../../../../../src/domains/session/monthly/year'
import { YearMonthQuery } from '../../../../../src/domains/session/monthly/year-month-query'

describe('DrivingSessionSearcherのテスト', () => {
  const tableName = 'DrivingSessions'

  test('検索を行い、DistanceCalculatorのインスタンスを返すこと', async () => {
    jest
      .spyOn(MonthlySessionsRepository.prototype, 'searchSessionsByYearMonth')
      .mockResolvedValue([])
    jest
      .spyOn(MonthlySessionsRepository.prototype, 'findPreviousMonthLatestSessionIfExists')
      .mockResolvedValueOnce(FindResult.ofEmpty())

    const repository = new MonthlySessionsRepository(tableName)
    const userId = 'user-123'
    const yearMonth = YearMonthQuery.of(Year.of('2025'), Month.of('5'))
    const searcher = new DrivingSessionSearcher(repository, userId, yearMonth)

    const result = await searcher.search()

    expect(result).toBeInstanceOf(DistanceCalculator)
    expect(MonthlySessionsRepository.prototype.searchSessionsByYearMonth).toHaveBeenCalledWith(
      userId,
      yearMonth,
    )
    expect(
      MonthlySessionsRepository.prototype.findPreviousMonthLatestSessionIfExists,
    ).toHaveBeenCalledWith(userId, yearMonth)
  })
})
