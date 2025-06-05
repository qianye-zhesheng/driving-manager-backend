import { EmptyBodyValidator } from './empty-body-validator'
import { ValidationResult } from './validation-result'
import { AnswerParam } from './answer-param'
import { ParamDetailValidator } from './param-detail-validator'

export class ParamValidator {
  private constructor(private readonly bodyJSON: string | null) {}

  public static of(bodyJSON: string | null): ParamValidator {
    return new ParamValidator(bodyJSON)
  }

  public validate(): ValidationResult {
    const emptyBodyValidation = EmptyBodyValidator.validate(this.bodyJSON)
    if (emptyBodyValidation.isInvalid()) {
      return emptyBodyValidation
    }

    return ParamDetailValidator.validate(this.bodyJSON as string)
  }
}
