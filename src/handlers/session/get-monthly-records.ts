import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { QueryValidator } from '../../domains/session/monthly/query-validator'
import { Response } from '../../domains/session/monthly/response'
import { AuthUserInfo } from '../../auth/auth-user-info'
import { MonthlySessionsRepository } from '../../domains/session/monthly/monthly-sessions-repository'
import { QueryParser } from '../../domains/session/monthly/query-parser'
import { DrivingSessionSearcher } from '../../domains/session/monthly/driving-session-searcher'

const TABLE_NAME: string = process.env.DRIVING_SESSIONS_TABLE as string

const repository: MonthlySessionsRepository = new MonthlySessionsRepository(TABLE_NAME)

export const getMonthlyRecordsHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const validationResult = QueryValidator.from(event.queryStringParameters).validate()

  if (validationResult.isInvalid()) {
    return Response.of400(validationResult.getErrorMessage()).toApiResult()
  }

  const authInfo = AuthUserInfo.from(event)
  if (authInfo.isNotAuthenticated()) {
    return Response.of401('Unauthorized').toApiResult()
  }

  const userId = authInfo.getUserId()

  const yearMonthQuery = QueryParser.from(event.queryStringParameters).parse()

  let response: Response

  try {
    response = (await new DrivingSessionSearcher(repository, userId, yearMonthQuery).search())
      .calc()
      .summarize()
  } catch (error) {
    console.log(error.stack)
    response = Response.of500(error.message)
  }

  console.info(
    `response from: ${event.path} statusCode: ${response.getStatusCode()} body: ${response.getBody()}`,
  )
  return response.toApiResult()
}
