import { Month } from '../../../../../src/domains/session/monthly/month'
import { Year } from '../../../../../src/domains/session/monthly/year'
import { YearMonthQuery } from '../../../../../src/domains/session/monthly/year-month-query'

describe('YearMonthQueryのテスト', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('fromで年月の初日のDateNumberが取得できること', () => {
    jest.spyOn(Year.prototype, 'get').mockReturnValue(2023)
    jest.spyOn(Month.prototype, 'get').mockReturnValue(5)

    const query = YearMonthQuery.of(Year.of('2023'), Month.of('5'))
    expect(query.from().get()).toBe(20230501)
    expect(Year.prototype.get).toHaveBeenCalled()
    expect(Month.prototype.get).toHaveBeenCalled()
  })

  test('toで年月の末日のDateNumberが取得できること', () => {
    jest.spyOn(Year.prototype, 'get').mockReturnValue(2025)
    jest.spyOn(Month.prototype, 'get').mockReturnValue(7)

    const query = YearMonthQuery.of(Year.of('2025'), Month.of('7'))
    expect(query.to().get()).toBe(20250731)
    expect(Year.prototype.get).toHaveBeenCalled()
    expect(Month.prototype.get).toHaveBeenCalled()
  })

  test('toでうるう年に対応した年月の末日のDateNumberが取得できること', () => {
    jest.spyOn(Year.prototype, 'get').mockReturnValue(2024)
    jest.spyOn(Month.prototype, 'get').mockReturnValue(2)

    const query = YearMonthQuery.of(Year.of('2024'), Month.of('2'))
    expect(query.to().get()).toBe(20240229)
    expect(Year.prototype.get).toHaveBeenCalled()
    expect(Month.prototype.get).toHaveBeenCalled()
  })

  test('getYearでYearが取得できること', () => {
    const year = Year.of('2022')
    const month = Month.of('3')
    const query = YearMonthQuery.of(year, month)

    expect(query.getYear()).toEqual(year)
  })

  test('getMonthでMonthが取得できること', () => {
    const year = Year.of('2022')
    const month = Month.of('3')
    const query = YearMonthQuery.of(year, month)

    expect(query.getMonth()).toEqual(month)
  })
})
