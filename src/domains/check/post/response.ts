import { APIGatewayProxyResult } from 'aws-lambda'
import { AnswerParam } from './answer-param'
import { CorsHeaders } from '../../../config/cors-headers'

export class Response {
  private constructor(
    private readonly statusCode: number,
    private readonly body: string,
  ) {}

  public static of400(message: string): Response {
    return new Response(400, JSON.stringify({ message: message }))
  }

  public static of200(answerParam: AnswerParam, dateTime: string): Response {
    const responseBody = {
      userId: answerParam.userId,
      dateTime: dateTime,
      imSafeAnswer: answerParam.imSafeAnswer,
      weatherAnswer: answerParam.weatherAnswer,
      judgement: answerParam.judgement,
    }
    return new Response(200, JSON.stringify(responseBody))
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
