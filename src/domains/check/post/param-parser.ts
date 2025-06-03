import { AnswerParam } from './answer-param'
import { ParamDetailValidator } from './param-detail-validator'

export class ParamParser {
  private constructor(private readonly rawBody: string) {
    if (ParamDetailValidator.validate(rawBody).isInvalid()) {
      throw new Error('param is invalid')
    }
    this.rawBody = rawBody
  }

  public static from(rawBody: string): ParamParser {
    return new ParamParser(rawBody)
  }

  public parse(): AnswerParam {
    return AnswerParam.safeParse(JSON.parse(this.rawBody)).data as AnswerParam
  }
}
