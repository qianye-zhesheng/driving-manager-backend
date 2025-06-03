import { ParamValidator } from '../../../../../src/domains/check/post/param-validator'
import eventPutAnswer from '../../../../../events/check/event-put-answer.json'
import invalidParams from './invalid-params.json'

describe('ParamDetailValidatorのテスト', () => {
  test('validなparamならvalidの結果を返すこと', () => {
    const result = ParamValidator.of(eventPutAnswer.body).validate()
    expect(result.isValid()).toBe(true)
  })

  test('nullのparamならinvalidの結果を返すこと', () => {
    const result = ParamValidator.of(null).validate()
    expect(result.isValid()).toBe(false)
    expect(result.getErrorMessage()).toBe('Request body is required')
  })

  test('invalidなparamならinvalidの結果を返すこと', () => {
    invalidParams.missingContents.forEach((param) => {
      const body = JSON.stringify(param)
      const result = ParamValidator.of(body).validate()
      expect(result.isValid()).toBe(false)
      expect(result.getErrorMessage().startsWith('Invalid request body')).toBe(true)
    })
  })
})
