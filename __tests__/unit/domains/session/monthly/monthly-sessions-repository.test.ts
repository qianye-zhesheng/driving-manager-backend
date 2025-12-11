import { MonthlySessionsRepository } from '../../../../../src/domains/session/monthly/monthly-sessions-repository'
import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { YearMonthQuery } from '../../../../../src/domains/session/monthly/year-month-query'
import { Year } from '../../../../../src/domains/session/monthly/year'
import { Month } from '../../../../../src/domains/session/monthly/month'
import { DrivingSession } from '../../../../../src/domains/session/driving-session'
import { DateNumber } from '../../../../../src/domains/session/date-number'

describe('MonthlySessionsRepositoryのテスト', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient)

  const tableName = 'DrvivingSessions'

  const userId = 'user123'

  const item1 = {
    user_id: userId,
    date_number: 20250101,
    operation_date: '2025-01-01',
    finished: false,
    start_odometer: 10000,
  }
  const item2 = {
    user_id: userId,
    date_number: 20250102,
    operation_date: '2025-01-02',
    finished: true,
    start_odometer: 10100,
    end_odometer: 10150,
  }

  const session1: DrivingSession = {
    userId: userId,
    dateNumber: 20250101,
    operationDate: '2025-01-01',
    finished: false,
    startOdometer: 10000,
  }
  const session2: DrivingSession = {
    userId: userId,
    dateNumber: 20250102,
    operationDate: '2025-01-02',
    finished: true,
    startOdometer: 10100,
    endOdometer: 10150,
  }

  beforeEach(() => {
    ddbMock.reset()
    jest.restoreAllMocks()
  })

  test('searchSessionsByYearMonthは該当レコードをDrivingSessionにマッピングして返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 2,
      Items: [item1, item2],
    })

    jest.spyOn(YearMonthQuery.prototype, 'from').mockReturnValue(DateNumber.of('2025-01-01'))
    jest.spyOn(YearMonthQuery.prototype, 'to').mockReturnValue(DateNumber.of('2025-01-31'))

    const yearMonth = YearMonthQuery.of(Year.of('2025'), Month.of('1'))

    const result = await new MonthlySessionsRepository(tableName).searchSessionsByYearMonth(
      userId,
      yearMonth,
    )

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(session1)
    expect(result[1]).toEqual(session2)

    expect(YearMonthQuery.prototype.from).toHaveBeenCalled()
    expect(YearMonthQuery.prototype.to).toHaveBeenCalled()
  })

  test('searchSessionsByYearMonthは該当レコードがなければ空配列を返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 0,
      Items: [],
    })

    jest.spyOn(YearMonthQuery.prototype, 'from').mockReturnValue(DateNumber.of('2025-01-01'))
    jest.spyOn(YearMonthQuery.prototype, 'to').mockReturnValue(DateNumber.of('2025-01-31'))

    const yearMonth = YearMonthQuery.of(Year.of('2025'), Month.of('1'))

    const result = await new MonthlySessionsRepository(tableName).searchSessionsByYearMonth(
      userId,
      yearMonth,
    )

    expect(result).toEqual([])
    expect(YearMonthQuery.prototype.from).toHaveBeenCalled()
    expect(YearMonthQuery.prototype.to).toHaveBeenCalled()
  })

  test('findPreviousMonthLatestSessionIfExistsは前月の最新レコードがあれば返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 1,
      Items: [item2],
    })

    jest.spyOn(YearMonthQuery.prototype, 'from').mockReturnValue(DateNumber.of('2025-02-01'))

    const currentYearMonth = YearMonthQuery.of(Year.of('2025'), Month.of('2'))

    const result = await new MonthlySessionsRepository(
      tableName,
    ).findPreviousMonthLatestSessionIfExists(userId, currentYearMonth)

    expect(result.exists()).toBe(true)
    expect(result.get()).toEqual(session2)

    expect(YearMonthQuery.prototype.from).toHaveBeenCalled()
  })

  test('findPreviousMonthLatestSessionIfExistsは前月のレコードがなければ空の結果を返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 0,
    })

    jest.spyOn(YearMonthQuery.prototype, 'from').mockReturnValue(DateNumber.of('2025-02-01'))

    const currentYearMonth = YearMonthQuery.of(Year.of('2025'), Month.of('2'))

    const result = await new MonthlySessionsRepository(
      tableName,
    ).findPreviousMonthLatestSessionIfExists(userId, currentYearMonth)

    expect(result.exists()).toBe(false)
    expect(YearMonthQuery.prototype.from).toHaveBeenCalled()
  })
})
