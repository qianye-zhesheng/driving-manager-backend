import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { ParamValidator } from '../../domains/session/param-validator'
import { ParamParser } from '../../domains/session/param-parser'
import { DrivingSession } from '../../domains/session/driving-session'
import { Response } from '../../domains/session/response'
import { DrivingSessionRepository } from '../../domains/session/driving-session-repository'
import { SessionParam } from '../../domains/session/session-param'

const TABLE_NAME: string = process.env.DRIVING_SESSIONS_TABLE as string

const repository: DrivingSessionRepository = new DrivingSessionRepository(TABLE_NAME)

/**
 * 運行前チェック結果を受け取って保存する
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
  const drivingSession: DrivingSession = {
    userId: sessionParam.userId,
    date: sessionParam.date,
    finished: false,
    startOdometer: sessionParam.odometer,
  }

  const response: Response = await repository.save(drivingSession)

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.getStatusCode()} body: ${response.getBody()}`,
  )
  return response.toApiResult()
}
