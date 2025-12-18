import { ParamParser } from '../../../../../src/domains/check/post/param-parser'
import eventPostAnswer from '../../../../../events/check/event-post-answer.json'
import invalidParams from './invalid-params.json'
import { AnswerParam } from '../../../../../src/domains/check/post/answer-param'

describe('ParamParserのテスト', () => {
  test('validなparamなら例外を投げないこと', () => {
    expect(() => {
      ParamParser.from(eventPostAnswer.body).parse()
    }).not.toThrow(Error)
  })

  test('項目が一部足りないparamなら例外を投げること', () => {
    invalidParams.missingContents.forEach((param) => {
      const body = JSON.stringify(param)
      expect(() => {
        ParamParser.from(body).parse()
      }).toThrow('param is invalid')
    })
  })

  test('parseされた内容がAnswerParamの型であること', () => {
    const answerParam: AnswerParam = ParamParser.from(eventPostAnswer.body).parse()
    expect(answerParam).toHaveProperty('imSafeAnswer')
    expect(answerParam).toHaveProperty('imSafeAnswer.illness', 1)
    expect(answerParam).toHaveProperty('imSafeAnswer.medication', 1)
    expect(answerParam).toHaveProperty('imSafeAnswer.stress', 1)
    expect(answerParam).toHaveProperty('imSafeAnswer.alcohol', 1)
    expect(answerParam).toHaveProperty('imSafeAnswer.fatigue', 1)
    expect(answerParam).toHaveProperty('imSafeAnswer.emotion', 1)

    expect(answerParam).toHaveProperty('weatherAnswer')
    expect(answerParam).toHaveProperty('weatherAnswer.wetRoad', 1)
    expect(answerParam).toHaveProperty('weatherAnswer.visibility', 1)
    expect(answerParam).toHaveProperty('weatherAnswer.icyRoad', 1)
    expect(answerParam).toHaveProperty('weatherAnswer.snow', 1)

    expect(answerParam).toHaveProperty('judgement', 'no limitations')
  })
})
