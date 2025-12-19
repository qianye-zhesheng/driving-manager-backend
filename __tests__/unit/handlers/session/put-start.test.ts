import { CorsHeaders } from '../../../../src/config/cors-headers'
import event from '../../../../events/session/event-put-start.json'
import { ParamValidator } from '../../../../src/domains/session/param-validator'
import { ValidationResult } from '../../../../src/domains/session/validation-result'
import { putStartHandler } from '../../../../src/handlers/session/put-start'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { DrivingSession } from '../../../../src/domains/session/driving-session'
import { StartSessionSaver } from '../../../../src/domains/session/start/start-sessio-saver'
import { Response } from '../../../../src/domains/session/response'
import { ParamParser } from '../../../../src/domains/session/param-parser'
import { SessionParam } from '../../../../src/domains/session/session-param'
import { AuthUserInfo } from '../../../../src/auth/auth-user-info'

describe('put-start handler', () => {
  const headers: { [header: string]: string } = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }

  const drivingSession: DrivingSession = {
    userId: 'user123',
    dateNumber: 20250101,
    operationDate: '2025-01-01',
    finished: false,
    startOdometer: 10000,
  }

  const sessionParam: SessionParam = {
    date: '2025-01-01',
    odometer: 10000,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(CorsHeaders, 'get').mockReturnValue(headers)
    jest.spyOn(ParamParser.prototype, 'parse').mockReturnValue(sessionParam)

    jest.spyOn(AuthUserInfo.prototype, 'isNotAuthenticated').mockReturnValue(false)
    jest.spyOn(AuthUserInfo.prototype, 'getUserId').mockReturnValue('user123')
  })

  test('無効なparamなら400を返すこと', async () => {
    jest
      .spyOn(ParamValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.invalid('userId is required'))

    jest
      .spyOn(StartSessionSaver.prototype, 'save')
      .mockResolvedValue(Response.of200(drivingSession))

    const result = await putStartHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(400)
    expect(result.body).toBe(JSON.stringify({ message: 'userId is required' }))

    expect(ParamValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(ParamParser.prototype.parse).toHaveBeenCalledTimes(0)
    expect(StartSessionSaver.prototype.save).toHaveBeenCalledTimes(0)
    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)

    expect(AuthUserInfo.prototype.isNotAuthenticated).toHaveBeenCalledTimes(0)
    expect(AuthUserInfo.prototype.getUserId).toHaveBeenCalledTimes(0)
  })

  test('有効なparamなら200を返すこと', async () => {
    jest.spyOn(ParamValidator.prototype, 'validate').mockReturnValue(ValidationResult.valid())
    jest
      .spyOn(StartSessionSaver.prototype, 'save')
      .mockResolvedValue(Response.of200(drivingSession))

    const result = await putStartHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify({
        userId: drivingSession.userId,
        dateNumber: drivingSession.dateNumber,
        operationDate: drivingSession.operationDate,
        finished: drivingSession.finished,
        startOdometer: drivingSession.startOdometer,
      }),
    )

    expect(ParamValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(ParamParser.prototype.parse).toHaveBeenCalledTimes(1)
    expect(StartSessionSaver.prototype.save).toHaveBeenCalledTimes(1)
    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)

    expect(AuthUserInfo.prototype.isNotAuthenticated).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.prototype.getUserId).toHaveBeenCalledTimes(1)
  })

  test('認証されていないと401を返すこと', async () => {
    jest.spyOn(ParamValidator.prototype, 'validate').mockReturnValue(ValidationResult.valid())
    jest
      .spyOn(StartSessionSaver.prototype, 'save')
      .mockResolvedValue(Response.of200(drivingSession))

    jest.spyOn(AuthUserInfo.prototype, 'isNotAuthenticated').mockReturnValue(true)

    const result = await putStartHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(401)
    expect(result.body).toBe(JSON.stringify({ message: 'Unauthorized' }))

    expect(ParamValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(ParamParser.prototype.parse).toHaveBeenCalledTimes(1)
    expect(StartSessionSaver.prototype.save).toHaveBeenCalledTimes(0)
    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)

    expect(AuthUserInfo.prototype.isNotAuthenticated).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.prototype.getUserId).toHaveBeenCalledTimes(0)
  })
})
