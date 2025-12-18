import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { ParamValidator } from '../../domains/session/param-validator'
import { ParamParser } from '../../domains/session/param-parser'
import { DrivingSession } from '../../domains/session/driving-session'
import { Response } from '../../domains/session/response'
import { SessionParam } from '../../domains/session/session-param'
import { DateNumber } from '../../domains/session/date-number'
import { StartSessionSaver } from '../../domains/session/start/start-sessio-saver'
import { StartSessionRepository } from '../../domains/session/start/start-session-repository'
import { AuthUserInfo } from '../../auth/auth-user-info'

const TABLE_NAME: string = process.env.DRIVING_SESSIONS_TABLE as string

const repository: StartSessionRepository = new StartSessionRepository(TABLE_NAME)

/**
 * 運行開始メーター値を受け取って保存する
 */
export const putStartHandler = async (
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
  if (authInfo.isNotAuthenticated() || authInfo.getUserId() !== sessionParam.userId) {
    return Response.of401('Unauthorized').toApiResult()
  }

  const drivingSession: DrivingSession = {
    userId: sessionParam.userId,
    dateNumber: DateNumber.of(sessionParam.date).get(),
    operationDate: sessionParam.date,
    finished: false,
    startOdometer: sessionParam.odometer,
  }

  const response: Response = await new StartSessionSaver(repository, drivingSession).save()

  console.info(
    `response from: ${event.path} statusCode: ${response.getStatusCode()} body: ${response.getBody()}`,
  )
  return response.toApiResult()
}
