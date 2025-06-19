import { DrivingSession } from '../../../../src/domains/session/driving-session'
import { Response } from '../../../../src/domains/session/response'
import { CorsHeaders } from '../../../../src/config/cors-headers'

describe('Responseのテスト', () => {
  const headers: { [header: string]: string } = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(CorsHeaders, 'get').mockReturnValue(headers)
  })

  it('should create a 200 response with driving session', () => {
    const drivingSession: DrivingSession = {
      userId: 'user123',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: false,
      startOdometer: 10000,
    }
    const response = Response.of200(drivingSession)

    expect(response.toApiResult()).toEqual({
      statusCode: 200,
      body: JSON.stringify(drivingSession),
      headers: headers,
    })
    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
  })

  it('should create a 400 response with a message', () => {
    const message = 'Bad Request'
    const response = Response.of400(message)

    expect(response.toApiResult()).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: message }),
      headers: headers,
    })

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
  })

  it('should create a 409 response with a message', () => {
    const message = 'Duplicated data'
    const response = Response.of409(message)

    expect(response.toApiResult()).toEqual({
      statusCode: 409,
      body: JSON.stringify({ message: message }),
      headers: headers,
    })

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
  })

  it('should create a 500 response with a message', () => {
    const message = 'Internal Server Error'
    const response = Response.of500(message)

    expect(response.toApiResult()).toEqual({
      statusCode: 500,
      body: JSON.stringify({ message: message }),
      headers: headers,
    })
    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
  })

  it('should return the correct status code and body', () => {
    const response = Response.of500('Error occurred')

    expect(response.getStatusCode()).toBe(500)
    expect(response.getBody()).toBe(JSON.stringify({ message: 'Error occurred' }))
    expect(CorsHeaders.get).toHaveBeenCalledTimes(0) // CorsHeadersはtoApiResult内でのみ呼ばれるため、ここでは呼ばれない
  })
})
