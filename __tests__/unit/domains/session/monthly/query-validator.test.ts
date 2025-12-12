import { Month } from '../../../../../src/domains/session/monthly/month'
import { QueryValidator } from '../../../../../src/domains/session/monthly/query-validator'
import { Year } from '../../../../../src/domains/session/monthly/year'

describe('QueryValidatorのテスト', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('queryParamsがnullの場合、無効なValidationResultを返すこと', () => {
    const validator = QueryValidator.from(null)
    const result = validator.validate()
    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('query parameters are missing')
  })

  test('yearが不正の場合、無効なValidationResultを返すこと', () => {
    jest.spyOn(Year, 'of').mockImplementation(() => {
      throw new Error('Invalid year format')
    })

    const queryParams = { year: 'invalidYear', month: '5' }
    const validator = QueryValidator.from(queryParams)
    const result = validator.validate()

    expect(Year.of).toHaveBeenCalledTimes(1)
    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('Invalid year format')
  })

  test('monthが不正の場合、無効なValidationResultを返すこと', () => {
    jest.spyOn(Month, 'of').mockImplementation(() => {
      throw new Error('Invalid month format')
    })

    const queryParams = { year: '2023', month: 'invalidMonth' }
    const validator = QueryValidator.from(queryParams)
    const result = validator.validate()

    expect(Month.of).toHaveBeenCalledTimes(1)
    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('Invalid month format')
  })

  test('yearとmonthが有効な場合、有効なValidationResultを返すこと', () => {
    const queryParams = { year: '2023', month: '5' }
    const validator = QueryValidator.from(queryParams)
    const result = validator.validate()

    expect(result.isValid()).toBe(true)
  })
})
