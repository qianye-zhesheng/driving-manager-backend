import { EmptyBodyValidator } from './empty-body-validator'
import { ValidationResult } from './validation-result'
import { ParamDetailValidator } from './param-detail-validator'

export class ParamValidator {
  private constructor(private readonly requestBody: string | null) {}

  public static of(requestBody: string | null): ParamValidator {
    return new ParamValidator(requestBody)
  }

  public validate(): ValidationResult {
    const emptyBodyValidation = EmptyBodyValidator.validate(this.requestBody)
    if (emptyBodyValidation.isInvalid()) {
      return emptyBodyValidation
    }

    return ParamDetailValidator.validate(this.requestBody as string)
  }
}
