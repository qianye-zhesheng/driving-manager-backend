import { APIGatewayProxyResult } from 'aws-lambda'
import { CorsHeaders } from '../../../config/cors-headers'
import { CheckAnswer } from './check-answer'

export class Response {
  private constructor(
    private readonly statusCode: number,
    private readonly body: string,
  ) {}

  public static of400(message: string): Response {
    return new Response(400, JSON.stringify({ message: message }))
  }

  public static of401(message: string): Response {
    return new Response(401, JSON.stringify({ message: message }))
  }

  public static of200(checkAnswer: CheckAnswer): Response {
    return new Response(200, JSON.stringify(checkAnswer))
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
