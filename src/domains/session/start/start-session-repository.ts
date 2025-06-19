import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { DrivingSession } from '../driving-session'
import { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { FindResult } from './find-result'

export class StartSessionRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly tableName: string

  constructor(tableName: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.tableName = tableName
  }

  public async existUnfinishedSessions(userId: string, dateNumber: number): Promise<boolean> {
    const unfinishedSessions = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :userId AND date_number <> :dateNumber',
        FilterExpression: 'finished = :finished',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':dateNumber': dateNumber,
          ':finished': false,
        },
      }),
    )
    if (unfinishedSessions.Count > 0) {
      return true
    }
    return false
  }

  public async findPreviousSessionIfExists(
    userId: string,
    dateNumber: number,
  ): Promise<FindResult> {
    const previousSession = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :userId AND date_number < :dateNumber',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':dateNumber': dateNumber,
        },
        ScanIndexForward: false,
        Limit: 1,
      }),
    )

    if (previousSession.Count == 0) {
      return FindResult.ofEmpty()
    }

    return FindResult.of(this.toEntity(previousSession.Items[0]))
  }

  public async findSameDateSessionIfExists(
    userId: string,
    dateNumber: number,
  ): Promise<FindResult> {
    const sameDateSession = await this.ddbDocClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          user_id: userId,
          date_number: dateNumber,
        },
      }),
    )

    if (sameDateSession.Item == undefined) {
      return FindResult.ofEmpty()
    }

    return FindResult.of(this.toEntity(sameDateSession.Item))
  }

  public async create(drivingSession: DrivingSession): Promise<void> {
    await this.ddbDocClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          user_id: drivingSession.userId,
          date_number: drivingSession.dateNumber,
          operation_date: drivingSession.operationDate,
          finished: drivingSession.finished,
          start_odometer: drivingSession.startOdometer,
        },
        ConditionExpression: 'attribute_not_exists(user_id) AND attribute_not_exists(date_number)',
      }),
    )
  }

  public async update(
    drivingSession: DrivingSession,
    existingDrivingSession: DrivingSession,
  ): Promise<void> {
    await this.ddbDocClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          user_id: existingDrivingSession.userId,
          date_number: existingDrivingSession.dateNumber,
        },
        UpdateExpression: 'set start_odometer = :startOdometer',
        ConditionExpression: 'start_odometer = :originalStartOdometer',
        ExpressionAttributeValues: {
          ':startOdometer': drivingSession.startOdometer,
          ':originalStartOdometer': existingDrivingSession.startOdometer,
        },
      }),
    )
  }

  private toEntity(item: Record<string, AttributeValue>): DrivingSession {
    return {
      userId: item.user_id.S,
      dateNumber: Number(item.date_number.N),
      operationDate: item.operation_date.S,
      finished: item.finished.BOOL,
      startOdometer: Number(item.start_odometer.N),
      endOdometer: item.end_odometer == undefined ? undefined : Number(item.end_odometer.N),
    } as DrivingSession
  }
}
