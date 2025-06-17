import { EmptyBodyValidator } from '../../../../src/domains/session/empty-body-validator'

describe('EmptyBodyValidatorのテスト', () => {
  it('should return valid for non-empty body', () => {
    const body = 'This is a valid body'
    const result = EmptyBodyValidator.validate(body)
    expect(result.isValid()).toBe(true)
    expect(result.isInvalid()).toBe(false)
    expect(result.getErrorMessage()).toBe('')
  })

  it('should return invalid for null body', () => {
    const body = null
    const result = EmptyBodyValidator.validate(body)
    expect(result.isValid()).toBe(false)
    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('Request body is required')
  })

  it('should return invalid for empty string body', () => {
    const body = ''
    const result = EmptyBodyValidator.validate(body)
    expect(result.isValid()).toBe(false)
    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('Request body is required')
  })

  it('should return invalid for whitespace-only body', () => {
    const body = '   '
    const result = EmptyBodyValidator.validate(body)
    expect(result.isValid()).toBe(false)
    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('Request body is required')
  })
})
