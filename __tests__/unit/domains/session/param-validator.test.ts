import { ParamValidator } from '../../../../src/domains/session/param-validator'
import eventPutStart from '../../../../events/session/event-put-start.json'
import { EmptyBodyValidator } from '../../../../src/domains/session/empty-body-validator'
import { ValidationResult } from '../../../../src/domains/session/validation-result'
import { ParamDetailValidator } from '../../../../src/domains/session/param-detail-validator'

describe('ParamDetailValidatorのテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('validなparamならvalidの結果を返すこと', () => {
    jest.spyOn(EmptyBodyValidator, 'validate').mockReturnValue(ValidationResult.valid())
    jest.spyOn(ParamDetailValidator, 'validate').mockReturnValue(ValidationResult.valid())

    const result = ParamValidator.of(eventPutStart.body).validate()
    expect(result.isValid()).toBe(true)

    expect(EmptyBodyValidator.validate).toHaveBeenCalledTimes(1)
    expect(ParamDetailValidator.validate).toHaveBeenCalledTimes(1)
  })

  test('空のparamならinvalidの結果を返すこと', () => {
    jest
      .spyOn(EmptyBodyValidator, 'validate')
      .mockReturnValue(ValidationResult.invalid('Request body is required'))
    jest.spyOn(ParamDetailValidator, 'validate').mockReturnValue(ValidationResult.valid())

    const result = ParamValidator.of(null).validate()
    expect(result.isValid()).toBe(false)
    expect(result.getErrorMessage()).toBe('Request body is required')

    expect(EmptyBodyValidator.validate).toHaveBeenCalledTimes(1)
    expect(ParamDetailValidator.validate).toHaveBeenCalledTimes(0)
  })

  test('invalidなparamならinvalidの結果を返すこと', () => {
    jest.spyOn(EmptyBodyValidator, 'validate').mockReturnValue(ValidationResult.valid())
    jest
      .spyOn(ParamDetailValidator, 'validate')
      .mockReturnValue(ValidationResult.invalid('parameter is invalid'))

    const result = ParamValidator.of(JSON.stringify({ invalid: true })).validate()
    expect(result.isValid()).toBe(false)
    expect(result.getErrorMessage()).toBe('parameter is invalid')

    expect(EmptyBodyValidator.validate).toHaveBeenCalledTimes(1)
    expect(ParamDetailValidator.validate).toHaveBeenCalledTimes(1)
  })
})
