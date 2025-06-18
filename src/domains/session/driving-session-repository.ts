import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { DrivingSession } from './driving-session'
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'
import { Response } from './response'

export class DrivingSessionRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly tableName: string

  constructor(tableName: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.tableName = tableName
  }

  async save(drivingSession: DrivingSession): Promise<Response> {
    const params = {
      TableName: this.tableName,
      Item: {
        user_id: drivingSession.userId,
        date: drivingSession.date,
        finished: drivingSession.finished,
        start_odometer: drivingSession.startOdometer,
        end_odometer: drivingSession.endOdometer,
        business_distance: drivingSession.businessDistance,
      },
    }

    // 1. 事前にfinished = falseのレコードがないか確認
    const unfinished = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: 'DrivingSessions',
        KeyConditionExpression: 'user_id = :uid',
        FilterExpression: 'finished = :f',
        ExpressionAttributeValues: {
          ':uid': { S: drivingSession.userId },
          ':f': { BOOL: false },
        },
      }),
    )
    if (unfinished.Count > 0) {
      return Response.of409('未完了のセッションがあります')
    }

    // 2. 直前のdateのレコードを取得
    const prevSession = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: 'DrivingSessions',
        KeyConditionExpression: 'user_id = :uid AND date < :newDate',
        ExpressionAttributeValues: {
          ':uid': { S: drivingSession.userId },
          ':newDate': { S: drivingSession.date },
        },
        ScanIndexForward: false, // 降順
        Limit: 1,
      }),
    )

    // 3. トランザクションでConditionCheck & Put
    const transactItems = []

    if (prevSession.Count > 0) {
      const prev = prevSession.Items[0]
      transactItems.push({
        ConditionCheck: {
          TableName: 'DrivingSessions',
          Key: { user_id: { S: drivingSession.userId }, date: { S: prev.date.S } },
          ConditionExpression: 'start_odometer <= :newOdo',
          ExpressionAttributeValues: {
            ':newOdo': { N: String(drivingSession.startOdometer) },
          },
        },
      })
    }

    transactItems.push({
      Put: {
        TableName: 'DrivingSessions',
        Item: {
          user_id: drivingSession.userId,
          date: drivingSession.date,
          start_odometer: drivingSession.startOdometer,
          finished: false,
          // 他の属性も必要に応じて
        },
      },
    })

    await this.ddbDocClient.send(
      new TransactWriteItemsCommand({
        TransactItems: transactItems,
      }),
    )

    return Response.of200(drivingSession)
  }
}
