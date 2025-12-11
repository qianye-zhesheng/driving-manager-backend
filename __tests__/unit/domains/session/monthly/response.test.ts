import { Response } from '../../../../../src/domains/session/monthly/response'
import { CorsHeaders } from '../../../../../src/config/cors-headers'

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

  it('should create a 200 response with monthly records', () => {
    const monthlyRecords = {
      summary: {
        year: 2024,
        month: 6,
        totalOfficialDistance: 1500,
        totalPrivateDistance: 500,
        officialPercentage: 75,
        privatePercentage: 25,
      },
      records: [
        {
          operationDate: '2024-06-01',
          startOdometer: 10000,
          endOdometer: 10200,
          finished: true,
          officialDistance: 150,
          privateDistance: 50,
        },
      ],
    }

    const response = Response.of200(monthlyRecords)

    expect(response.toApiResult()).toEqual({
      statusCode: 200,
      body: JSON.stringify(monthlyRecords),
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
