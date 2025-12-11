import { APIGatewayProxyEvent } from 'aws-lambda'

export class AuthUserInfo {
  private constructor(
    private readonly userId: string | undefined,
    private readonly authenticated: boolean,
  ) {}

  public static from(event: APIGatewayProxyEvent): AuthUserInfo {
    const userId = event.requestContext?.authorizer?.claims?.sub as string | undefined
    const authenticated = userId !== undefined
    return new AuthUserInfo(userId, authenticated)
  }

  public getUserId(): string {
    if (!this.authenticated || this.userId === undefined) {
      throw new Error('User is not authenticated')
    }
    return this.userId
  }

  public isAuthenticated(): boolean {
    return this.authenticated
  }

  public isNotAuthenticated(): boolean {
    return !this.authenticated
  }
}
