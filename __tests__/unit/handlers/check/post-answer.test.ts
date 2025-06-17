import { postAnswerHandler } from '../../../../src/handlers/check/post-answer'
import { ParamValidator } from '../../../../src/domains/check/post/param-validator'
import { ParamParser } from '../../../../src/domains/check/post/param-parser'
import { Response } from '../../../../src/domains/check/post/response'
import { AnswerRepository } from '../../../../src/domains/check/post/answer-repository'
import { ValidationResult } from '../../../../src/domains/check/post/validation-result'
import dayjs from 'dayjs'
import event from '../../../../events/check/event-post-answer.json'
import { AnswerParam } from '../../../../src/domains/check/post/answer-param'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { CorsHeaders } from '../../../../src/config/cors-headers'

describe('postAnswerHandlerのテスト', () => {
  const answerParam: AnswerParam = JSON.parse(event.body) as AnswerParam
  const datetime: string = '2025-01-01T00:00:00+09:00'
  const headers: { [header: string]: string } = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(ParamParser.prototype, 'parse').mockImplementation(() => {
      return answerParam
    })

    jest.spyOn(CorsHeaders, 'get').mockReturnValue(headers)

    jest.spyOn(AnswerRepository.prototype, 'saveAnswer').mockImplementation(() => {
      return Promise.resolve(Response.of200(answerParam, datetime))
    })
  })

  test('有効なparamなら200を返すこと', async () => {
    jest.spyOn(ParamValidator.prototype, 'validate').mockImplementation(() => {
      return ValidationResult.valid()
    })

    const result = await postAnswerHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify({
        userId: answerParam.userId,
        dateTime: datetime,
        imSafeAnswer: answerParam.imSafeAnswer,
        weatherAnswer: answerParam.weatherAnswer,
        judgement: answerParam.judgement,
      }),
    )

    expect(ParamValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(AnswerRepository.prototype.saveAnswer).toHaveBeenCalledTimes(1)
    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
  })

  test('無効なparamなら400を返すこと', async () => {
    jest.spyOn(ParamValidator.prototype, 'validate').mockImplementation(() => {
      return ValidationResult.invalid('Invalid parameters')
    })

    const result = await postAnswerHandler({ httpMethod: 'POST', body: '' } as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(400)
    expect(result.body).toBe(JSON.stringify({ message: 'Invalid parameters' }))

    expect(ParamValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(AnswerRepository.prototype.saveAnswer).toHaveBeenCalledTimes(0)
    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
  })
})
