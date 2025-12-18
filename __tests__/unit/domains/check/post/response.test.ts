import { Response } from '../../../../../src/domains/check/post/response'
import { CorsHeaders } from '../../../../../src/config/cors-headers'
import { CheckAnswer } from '../../../../../src/domains/check/post/check-answer'

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

  it('should create a 401 response with a message', () => {
    const message = 'Unauthorized'
    const response = Response.of401(message)

    expect(response.toApiResult()).toEqual({
      statusCode: 401,
      body: JSON.stringify({ message: message }),
      headers: headers,
    })

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
  })

  it('should create a 200 response with CheckAnswer', () => {
    const checkAnswer: CheckAnswer = {
      userId: 'user123',
      dateTime: '2025-01-01T10:00:00+09:00',
      imSafeAnswer: {
        illness: 1,
        medication: 1,
        stress: 1,
        alcohol: 1,
        fatigue: 1,
        emotion: 1,
      },
      weatherAnswer: {
        wetRoad: 1,
        visibility: 1,
        icyRoad: 1,
        snow: 1,
      },
      judgement: '制限なし',
    }
    const response = Response.of200(checkAnswer)

    expect(response.toApiResult()).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        userId: checkAnswer.userId,
        dateTime: checkAnswer.dateTime,
        imSafeAnswer: checkAnswer.imSafeAnswer,
        weatherAnswer: checkAnswer.weatherAnswer,
        judgement: checkAnswer.judgement,
      }),
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
