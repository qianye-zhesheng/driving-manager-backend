import { ValidationResult } from './validation-result'

export class EmptyBodyValidator {
  public static validate(body: string | null): ValidationResult {
    if (body == null || body.trim() === '') {
      return ValidationResult.invalid('Request body is required')
    }
    return ValidationResult.valid()
  }
}
