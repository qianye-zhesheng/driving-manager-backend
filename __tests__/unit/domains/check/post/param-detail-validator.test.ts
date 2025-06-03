import { ParamDetailValidator } from '../../../../../src/domains/check/post/param-detail-validator'
import eventPutAnswer from '../../../../../events/check/event-put-answer.json'
import invalidParams from './invalid-params.json'

describe('ParamDetailValidatorのテスト', () => {
  test('validなparamならvalidの結果を返すこと', () => {
    const result = ParamDetailValidator.validate(eventPutAnswer.body)
    expect(result.isValid()).toBe(true)
  })

  test('項目が一部足りないparamならinvalidの結果を返すこと', () => {
    invalidParams.missingContents.forEach((param) => {
      const body = JSON.stringify(param)
      const result = ParamDetailValidator.validate(body)
      expect(result.isValid()).toBe(false)
      expect(result.getErrorMessage().startsWith('Invalid request body')).toBe(true)
    })
  })

  test('ネストされた項目が一部足りないparamならinvalidの結果を返すこと', () => {
    invalidParams.missingNestedContents.forEach((param) => {
      const body = JSON.stringify(param)
      const result = ParamDetailValidator.validate(body)
      expect(result.isValid()).toBe(false)
      expect(result.getErrorMessage().startsWith('Invalid request body')).toBe(true)
    })
  })

  test('型が正しくないparamならinvalidの結果を返すこと', () => {
    invalidParams.differentTypes.forEach((param) => {
      const body = JSON.stringify(param)
      const result = ParamDetailValidator.validate(body)
      expect(result.isValid()).toBe(false)
      expect(result.getErrorMessage().startsWith('Invalid request body')).toBe(true)
    })
  })

  test('空のparamならinvalidの結果を返すこと', () => {
    const body = JSON.stringify(invalidParams.noContents)
    const result = ParamDetailValidator.validate(body)
    expect(result.isValid()).toBe(false)
    expect(result.getErrorMessage().startsWith('Invalid request body')).toBe(true)
  })
})
