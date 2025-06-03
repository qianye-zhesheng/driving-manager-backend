import { ValidationResult } from '../../../../../src/domains/check/post/validation-result'

describe('ValidationResultのテスト', () => {
  it('should create a valid result', () => {
    const result = ValidationResult.valid()
    expect(result.isValid()).toBe(true)
    expect(result.isInvalid()).toBe(false)
    expect(result.getErrorMessage()).toBe('')
  })

  it('should create an invalid result with an error message', () => {
    const errorMessage = 'Invalid input'
    const result = ValidationResult.invalid(errorMessage)
    expect(result.isValid()).toBe(false)
    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe(errorMessage)
  })
})
