import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
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
    console.log('driving session=', drivingSession)

    try {
      // 1. 事前にfinished = falseのレコードがないか確認
      // const unfinished = await this.ddbDocClient.send(
      //   new QueryCommand({
      //     TableName: 'DrivingSessions',
      //     KeyConditionExpression: 'user_id = :uid',
      //     FilterExpression: 'finished = :f',
      //     ExpressionAttributeValues: {
      //       ':uid': { S: drivingSession.userId },
      //       ':f': { BOOL: false },
      //     },
      //   }),
      // )
      // if (unfinished.Count > 0) {
      //   return Response.of409('未完了のセッションがあります')
      // }

      // 2. 直前のdateのレコードを取得
      const prevSession = await this.ddbDocClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'user_id = :uid AND operation_date < :newDate',
          ExpressionAttributeValues: {
            ':uid': drivingSession.userId,
            ':newDate': drivingSession.operationDate,
          },
          ScanIndexForward: false, // 降順
          Limit: 1,
        }),
      )

      console.log('prev session=', prevSession)

      // 3. トランザクションでConditionCheck & Put
      const transactItems: any[] = []

      const prev = prevSession.Items[0]

      console.log('transaction items=', transactItems)

      transactItems.push({
        Put: {
          TableName: this.tableName,
          Item: {
            user_id: drivingSession.userId,
            operation_date: drivingSession.operationDate,
            start_odometer: drivingSession.startOdometer,
            finished: false,
            // 他の属性も必要に応じて
          },
        },
      })

      console.log('transaction start before=', transactItems)

      //TODO トランザクション失敗時は例外が発生するので、そのハンドリングをどうするか実装必要

      await this.ddbDocClient.send(
        new TransactWriteItemsCommand({
          TransactItems: [
            {
              ConditionCheck: {
                TableName: this.tableName,
                Key: {
                  user_id: { S: drivingSession.userId },
                  operation_date: { N: String(prev.operation_date) },
                },
                ConditionExpression: 'start_odometer <= :newOdo',
                ExpressionAttributeValues: {
                  ':newOdo': { N: String(drivingSession.startOdometer) },
                },
              },
            },
            {
              Put: {
                TableName: this.tableName,
                Item: {
                  user_id: { S: drivingSession.userId },
                  operation_date: { N: String(drivingSession.operationDate) },
                  start_odometer: { N: String(drivingSession.startOdometer) },
                  finished: { BOOL: false },
                },
              },
            },
          ],
        }),
      )
    } catch (error) {
      console.log('Error when saving answer:', error.stack)
      return Response.of500(error.message)
    }

    return Response.of200(drivingSession)
  }
}
