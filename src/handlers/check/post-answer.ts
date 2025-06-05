import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { ImSafeAnswer, WeatherAnswer } from '../../domains/check/interfaces'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'

const client = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME: string = process.env.CHECK_ANSWERS_TABLE as string

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE: string = 'Asia/Tokyo'

/**
 * 運行前チェック結果を受け取って保存する
 */
export const postAnswerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== 'POST') {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`)
  }

  if (event.body == null) {
    throw new Error('body is null')
  }
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const body = JSON.parse(event.body)

  const userId: string = body.userId
  const imSafeAnswer: ImSafeAnswer = body.imSafeAnswer
  const weatherAnswer: WeatherAnswer = body.weatherAnswer
  const judgement: string = body.judgement

  const dateTime: string = dayjs().tz(TIMEZONE).format()

  const params = {
    TableName: TABLE_NAME,
    Item: {
      user_id: userId,
      date_time: dateTime,
      im_safe_answer: imSafeAnswer,
      weather_answer: weatherAnswer,
      judgement: judgement,
    },
  }

  try {
    const data = await ddbDocClient.send(new PutCommand(params))
    console.log('Success - item added or updated', data)
  } catch (err) {
    console.log('Error', err.stack)
  }

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify(body),
  }

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`,
  )
  return response
}
