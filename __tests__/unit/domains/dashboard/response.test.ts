import { Response } from '../../../../src/domains/dashboard/response'
import { CorsHeaders } from '../../../../src/config/cors-headers'
import { CurrentInfo } from '../../../../src/domains/dashboard/current-info'

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

  it('should create a 200 response with current info', () => {
    const currentInfo: CurrentInfo = {
      todaysCheck: {
        checkedAt: '2025-09-19T16:44:47+09:00',
        judgement: '運行停止',
      },
      activeSession: {
        date: '2025-09-16',
        startOdometer: 13000,
      },
    }

    const response = Response.of200(currentInfo)

    expect(response.toApiResult()).toEqual({
      statusCode: 200,
      body: JSON.stringify(currentInfo),
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
