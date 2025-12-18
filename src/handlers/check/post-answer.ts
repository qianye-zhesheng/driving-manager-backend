import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { ParamValidator } from '../../domains/check/post/param-validator'
import { ParamParser } from '../../domains/check/post/param-parser'
import { AnswerParam } from '../../domains/check/post/answer-param'
import { Response } from '../../domains/check/post/response'
import { AnswerRepository } from '../../domains/check/post/answer-repository'
import { AuthUserInfo } from '../../auth/auth-user-info'

const TABLE_NAME: string = process.env.CHECK_ANSWERS_TABLE as string

const repository: AnswerRepository = new AnswerRepository(TABLE_NAME)

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE: string = 'Asia/Tokyo'

/**
 * 運行前チェック結果を受け取って保存する
 */
export const postAnswerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const validationResult = ParamValidator.of(event.body).validate()

  if (validationResult.isInvalid()) {
    return Response.of400(validationResult.getErrorMessage()).toApiResult()
  }

  const answerParam: AnswerParam = ParamParser.from(event.body as string).parse()
  const dateTime: string = dayjs().tz(TIMEZONE).format()

  const authInfo = AuthUserInfo.from(event)
  if (authInfo.isNotAuthenticated() || authInfo.getUserId() !== answerParam.userId) {
    return Response.of401('Unauthorized').toApiResult()
  }

  const response: Response = await repository.saveAnswer(answerParam, dateTime)

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.getStatusCode()} body: ${response.getBody()}`,
  )
  return response.toApiResult()
}
