import { ValidationResult } from './validation-result'
import { AnswerParam } from './answer-param'
import { z } from 'zod/v4'

export class ParamDetailValidator {
  public static validate(rawBody: string): ValidationResult {
    const parsedBody = JSON.parse(rawBody)
    const result = AnswerParam.safeParse(parsedBody)
    if (result.success) {
      return ValidationResult.valid()
    }
    const errorMessages = z.prettifyError(result.error)
    return ValidationResult.invalid(`Invalid request body: ${errorMessages}`)
  }
}
