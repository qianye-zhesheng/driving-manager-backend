import { EmptyBodyValidator } from '../common/empty-body-validator'
import { ValidationResult } from '../common/validation-result'
import { AnswerParam } from './answer-param'
import { AnswerParamValidator } from './answer-param-validator'

export class PostAnswerValidator {
  private constructor(private readonly bodyJSON: string | null) {}

  public static of(bodyJSON: string | null): PostAnswerValidator {
    return new PostAnswerValidator(bodyJSON)
  }

  public validate(): ValidationResult {
    const emptyBodyValidation = EmptyBodyValidator.validate(this.bodyJSON)
    if (emptyBodyValidation.isInvalid()) {
      return emptyBodyValidation
    }

    return AnswerParamValidator.validate(this.bodyJSON as string)
  }
}
