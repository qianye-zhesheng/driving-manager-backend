import { Month } from '../../../../../src/domains/session/monthly/month'
import { QueryValidator } from '../../../../../src/domains/session/monthly/query-validator'
import { QueryParser } from '../../../../../src/domains/session/monthly/query-parser'
import { Year } from '../../../../../src/domains/session/monthly/year'
import { ValidationResult } from '../../../../../src/domains/session/validation-result'

describe('QueryParserのテスト', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('クエリ文字列が無効な場合、例外を投げること', () => {
    jest
      .spyOn(QueryValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.invalid('Invalid query parameters'))

    const invalidQueryParams = { year: '2023', month: '13' } // 無効な月
    expect(() => {
      QueryParser.from(invalidQueryParams)
    }).toThrow('Invalid query parameters')

    expect(QueryValidator.prototype.validate).toHaveBeenCalledTimes(1)
  })

  test('クエリ文字列が有効な場合、YearMonthQueryを正しく解析できること', () => {
    jest.spyOn(QueryValidator.prototype, 'validate').mockReturnValue(ValidationResult.valid())

    jest.spyOn(Year, 'of')
    jest.spyOn(Month, 'of')
    jest.spyOn(Year.prototype, 'get').mockReturnValue(2023)
    jest.spyOn(Month.prototype, 'get').mockReturnValue(5)

    const validQueryParams = { year: '2023', month: '5' }
    const parser = QueryParser.from(validQueryParams)
    const yearMonthQuery = parser.parse()

    expect(yearMonthQuery.from().get()).toBe(20230501)
    expect(QueryValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(Year.of).toHaveBeenCalledWith('2023')
    expect(Month.of).toHaveBeenCalledWith('5')
    expect(Year.prototype.get).toHaveBeenCalled()
    expect(Month.prototype.get).toHaveBeenCalled()
  })
})
