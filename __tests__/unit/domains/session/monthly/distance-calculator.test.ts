import { DistanceCalculator } from '../../../../../src/domains/session/monthly/distance-calculator'
import { DrivingSession } from '../../../../../src/domains/session/driving-session'
import { FindResult } from '../../../../../src/domains/session/monthly/find-result'
import { YearMonthQuery } from '../../../../../src/domains/session/monthly/year-month-query'
import { Year } from '../../../../../src/domains/session/monthly/year'
import { Month } from '../../../../../src/domains/session/monthly/month'

describe('DistanceCalculatorのテスト', () => {
  let mockYearMonthQuery: YearMonthQuery
  let mockYear: Year
  let mockMonth: Month

  beforeEach(() => {
    jest.restoreAllMocks()

    mockYear = Year.of('2025')
    mockMonth = Month.of('1')
    mockYearMonthQuery = YearMonthQuery.of(mockYear, mockMonth)

    jest.spyOn(mockYearMonthQuery, 'getYear').mockReturnValue(mockYear)
    jest.spyOn(mockYearMonthQuery, 'getMonth').mockReturnValue(mockMonth)
    jest.spyOn(mockYear, 'get').mockReturnValue(2025)
    jest.spyOn(mockMonth, 'get').mockReturnValue(1)
  })

  test('drivingSessionsが空の場合、recordsの要素数は0であること', () => {
    const calculator = new DistanceCalculator([], FindResult.ofEmpty(), mockYearMonthQuery)
    const builder = calculator.calc()
    const response = builder.summarize()

    const body = JSON.parse(response.getBody())
    const records = body.records
    expect(records.length).toBe(0)
  })

  test('drivingSessionsが1つだけ、かつprevMonthLastSessionがある場合、私用距離が計算されること', () => {
    const prev: DrivingSession = {
      userId: 'u',
      dateNumber: 20241231,
      operationDate: '2024-12-31',
      finished: true,
      startOdometer: 900,
      endOdometer: 995,
    }

    const session: DrivingSession = {
      userId: 'u',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 1000,
      endOdometer: 1050,
    }

    const calculator = new DistanceCalculator([session], FindResult.of(prev), mockYearMonthQuery)

    const builder = calculator.calc()
    const response = builder.summarize()
    const body = JSON.parse(response.getBody())
    const records = body.records
    expect(records.length).toBe(1)

    const record = records[0]
    expect(record.officialDistance).toBe(50)
    expect(record.privateDistance).toBe(5)
  })

  test('drivingSessionsが1つだけ、かつprevMonthLastSessionがない場合、私用距離は0になること', () => {
    const session: DrivingSession = {
      userId: 'u',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 1000,
      endOdometer: 1051,
    }

    const calculator = new DistanceCalculator([session], FindResult.ofEmpty(), mockYearMonthQuery)

    const builder = calculator.calc()
    const response = builder.summarize()
    const body = JSON.parse(response.getBody())
    const records = body.records
    expect(records.length).toBe(1)

    const record = records[0]
    expect(record.officialDistance).toBe(51)
    expect(record.privateDistance).toBe(0)
  })

  test('drivingSessionsが2つ、かつprevMonthLastSessionがない場合、先頭は私用距離0で合計が計算されること', () => {
    const first: DrivingSession = {
      userId: 'u',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 1000,
      endOdometer: 1050,
    }

    const second: DrivingSession = {
      userId: 'u',
      dateNumber: 20250102,
      operationDate: '2025-01-02',
      finished: true,
      startOdometer: 1051,
      endOdometer: 1150,
    }

    const calculator = new DistanceCalculator(
      [first, second],
      FindResult.ofEmpty(),
      mockYearMonthQuery,
    )
    const builder = calculator.calc()
    const response = builder.summarize()
    const body = JSON.parse(response.getBody())
    const records = body.records
    expect(records.length).toBe(2)

    const record1 = records[0]
    expect(record1.officialDistance).toBe(50)
    expect(record1.privateDistance).toBe(0)

    const record2 = records[1]
    expect(record2.officialDistance).toBe(99)
    expect(record2.privateDistance).toBe(1)
  })

  test('間に未完了セッションがある場合、業務距離と次セッションの私用距離が0になること', () => {
    const prev: DrivingSession = {
      userId: 'u',
      dateNumber: 20241231,
      operationDate: '2024-12-31',
      finished: true,
      startOdometer: 900,
      endOdometer: 995,
    }

    const first: DrivingSession = {
      userId: 'u',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: false,
      startOdometer: 1000,
    }

    const second: DrivingSession = {
      userId: 'u',
      dateNumber: 20250102,
      operationDate: '2025-01-02',
      finished: true,
      startOdometer: 1051,
      endOdometer: 1150,
    }

    const calculator = new DistanceCalculator(
      [first, second],
      FindResult.of(prev),
      mockYearMonthQuery,
    )
    const builder = calculator.calc()
    const response = builder.summarize()
    const body = JSON.parse(response.getBody())
    const records = body.records
    expect(records.length).toBe(2)

    const record1 = records[0]
    expect(record1.officialDistance).toBe(0)
    expect(record1.privateDistance).toBe(5)

    const record2 = records[1]
    expect(record2.officialDistance).toBe(99)
    expect(record2.privateDistance).toBe(0)
  })

  test('最後に未完了セッションがある場合、業務距離が0になること', () => {
    const prev: DrivingSession = {
      userId: 'u',
      dateNumber: 20241231,
      operationDate: '2024-12-31',
      finished: true,
      startOdometer: 900,
      endOdometer: 995,
    }

    const first: DrivingSession = {
      userId: 'u',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 1000,
      endOdometer: 1050,
    }

    const second: DrivingSession = {
      userId: 'u',
      dateNumber: 20250102,
      operationDate: '2025-01-02',
      finished: false,
      startOdometer: 1051,
    }

    const calculator = new DistanceCalculator(
      [first, second],
      FindResult.of(prev),
      mockYearMonthQuery,
    )
    const builder = calculator.calc()
    const response = builder.summarize()
    const body = JSON.parse(response.getBody())
    const records = body.records
    expect(records.length).toBe(2)

    const record1 = records[0]
    expect(record1.officialDistance).toBe(50)
    expect(record1.privateDistance).toBe(5)

    const record2 = records[1]
    expect(record2.officialDistance).toBe(0)
    expect(record2.privateDistance).toBe(1)
  })
})
