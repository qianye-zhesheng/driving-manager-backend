import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { ParamValidator } from '../../domains/session/param-validator'
import { ParamParser } from '../../domains/session/param-parser'
import { Response } from '../../domains/session/response'
import { SessionParam } from '../../domains/session/session-param'
import { EndSessionRepository } from '../../domains/session/end/end-session-repository'
import { EndSessionSaver } from '../../domains/session/end/end-sessio-saver'
import { AuthUserInfo } from '../../auth/auth-user-info'

const TABLE_NAME: string = process.env.DRIVING_SESSIONS_TABLE as string

const repository: EndSessionRepository = new EndSessionRepository(TABLE_NAME)

/**
 * 運行終了メーター値を受け取って保存する
 */
export const putEndHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const validationResult = ParamValidator.of(event.body).validate()

  if (validationResult.isInvalid()) {
    return Response.of400(validationResult.getErrorMessage()).toApiResult()
  }

  const sessionParam: SessionParam = ParamParser.from(event.body as string).parse()

  const authInfo = AuthUserInfo.from(event)
  if (authInfo.isNotAuthenticated()) {
    return Response.of401('Unauthorized').toApiResult()
  }

  const response: Response = await new EndSessionSaver(
    repository,
    sessionParam,
    authInfo.getUserId(),
  ).save()

  console.info(
    `response from: ${event.path} statusCode: ${response.getStatusCode()} body: ${response.getBody()}`,
  )
  return response.toApiResult()
}
