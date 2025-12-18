import { APIGatewayProxyResult } from 'aws-lambda'
import { DrivingSession } from './driving-session'
import { CorsHeaders } from '../../config/cors-headers'

export class Response {
  private constructor(
    private readonly statusCode: number,
    private readonly body: string,
  ) {}

  public static of200(drivingSession: DrivingSession): Response {
    return new Response(200, JSON.stringify(drivingSession))
  }

  public static of400(message: string): Response {
    return new Response(400, JSON.stringify({ message: message }))
  }

  public static of401(message: string): Response {
    return new Response(401, JSON.stringify({ message: message }))
  }

  public static of409(message: string): Response {
    return new Response(409, JSON.stringify({ message: message }))
  }

  public static of500(message: string): Response {
    return new Response(500, JSON.stringify({ message: message }))
  }

  public toApiResult(): APIGatewayProxyResult {
    return {
      statusCode: this.statusCode,
      body: this.body,
      headers: CorsHeaders.get(),
    }
  }

  public getStatusCode(): number {
    return this.statusCode
  }

  public getBody(): string {
    return this.body
  }
}
