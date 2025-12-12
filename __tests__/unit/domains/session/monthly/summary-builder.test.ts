import { SummaryBuilder } from '../../../../../src/domains/session/monthly/summary-builder'
import { SessionRecord, Summary } from '../../../../../src/domains/session/monthly/monthly-records'
import { YearMonthQuery } from '../../../../../src/domains/session/monthly/year-month-query'
import { Year } from '../../../../../src/domains/session/monthly/year'
import { Month } from '../../../../../src/domains/session/monthly/month'

describe('SummaryBuilderのテスト', () => {
  let mockYearMonthQuery: YearMonthQuery
  let mockYear: Year
  let mockMonth: Month

  // テストデータ
  const sessionRecords: Record<string, SessionRecord[]> = {
    empty: [],
    single: [
      {
        operationDate: '2025-01-01',
        startOdometer: 1000,
        endOdometer: 1050,
        finished: true,
        officialDistance: 31,
        privateDistance: 27,
      },
    ],
    double: [
      {
        operationDate: '2025-01-01',
        startOdometer: 1000,
        endOdometer: 1050,
        finished: true,
        officialDistance: 31,
        privateDistance: 17,
      },
      {
        operationDate: '2025-01-02',
        startOdometer: 1050,
        endOdometer: 1150,
        finished: true,
        officialDistance: 67,
        privateDistance: 0,
      },
    ],
  }

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

  test('sessionRecordsが空の場合、距離合計とパーセンテージはすべて0となること', () => {
    const builder = new SummaryBuilder(sessionRecords.empty, mockYearMonthQuery)
    const response = builder.summarize()

    const body = JSON.parse(response.getBody())
    const summary: Summary = body.summary

    expect(summary.totalOfficialDistance).toBe(0)
    expect(summary.totalPrivateDistance).toBe(0)
    expect(summary.officialPercentage).toBe(0)
    expect(summary.privatePercentage).toBe(0)
    expect(summary.year).toBe(2025)
    expect(summary.month).toBe(1)
  })

  test('sessionRecordsが1つの場合、距離合計とパーセンテージがそれぞれ計算されること', () => {
    const builder = new SummaryBuilder(sessionRecords.single, mockYearMonthQuery)
    const response = builder.summarize()

    const body = JSON.parse(response.getBody())
    const summary: Summary = body.summary

    expect(summary.totalOfficialDistance).toBe(31)
    expect(summary.totalPrivateDistance).toBe(27)
    expect(summary.officialPercentage).toBe(53)
    expect(summary.privatePercentage).toBe(47)
    expect(summary.year).toBe(2025)
    expect(summary.month).toBe(1)
  })

  test('sessionRecordsが2つの場合、距離合計とパーセンテージがそれぞれ計算されること', () => {
    const builder = new SummaryBuilder(sessionRecords.double, mockYearMonthQuery)
    const response = builder.summarize()

    const body = JSON.parse(response.getBody())
    const summary: Summary = body.summary

    expect(summary.totalOfficialDistance).toBe(98)
    expect(summary.totalPrivateDistance).toBe(17)
    expect(summary.officialPercentage).toBe(85)
    expect(summary.privatePercentage).toBe(15)
    expect(summary.year).toBe(2025)
    expect(summary.month).toBe(1)
  })
})
