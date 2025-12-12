import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { DrivingSession } from '../driving-session'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { YearMonthQuery } from './year-month-query'

export class MonthlySessionsRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly tableName: string

  constructor(tableName: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.tableName = tableName
  }

  public async searchSessionsByYearMonth(
    userId: string,
    yearMonthQuery: YearMonthQuery,
  ): Promise<DrivingSession[]> {
    const drivingSessions = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :userId AND date_number BETWEEN :from AND :to',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':from': yearMonthQuery.from().get(),
          ':to': yearMonthQuery.to().get(),
        },
      }),
    )

    return drivingSessions.Items.map((item) => this.toEntity(item))
  }

  private toEntity(item: Record<string, any>): DrivingSession {
    return {
      userId: item.user_id,
      dateNumber: item.date_number,
      operationDate: item.operation_date,
      finished: item.finished,
      startOdometer: item.start_odometer,
      endOdometer: item.end_odometer,
    } as DrivingSession
  }
}
