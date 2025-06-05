import { AnswerParam } from './answer-param'
import { ParamDetailValidator } from './param-detail-validator'

export class ParamParser {
  private constructor(private readonly paramStr: string) {
    if (ParamDetailValidator.validate(paramStr).isInvalid()) {
      throw new Error('param is invalid')
    }
    this.paramStr = paramStr
  }

  public static from(paramStr: string): ParamParser {
    return new ParamParser(paramStr)
  }

  public parse(): AnswerParam {
    return AnswerParam.safeParse(this.paramStr).data as AnswerParam
  }
}
