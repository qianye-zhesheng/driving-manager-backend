import { AuthUserInfo } from '../../../src/auth/auth-user-info'

describe('AuthUserInfoのテスト', () => {
  test('eventにsubがあると認証済みとしてuserIdが取得できる', () => {
    const event: any = { requestContext: { authorizer: { claims: { sub: 'user-123' } } } }
    const auth = AuthUserInfo.from(event)
    expect(auth.isAuthenticated()).toBe(true)
    expect(auth.isNotAuthenticated()).toBe(false)
    expect(auth.getUserId()).toBe('user-123')
  })

  test('eventにsubがないと認証されていないと判定され、getUserIdは例外を投げる', () => {
    const event: any = { requestContext: { authorizer: { claims: {} } } }
    const auth = AuthUserInfo.from(event)
    expect(auth.isAuthenticated()).toBe(false)
    expect(auth.isNotAuthenticated()).toBe(true)
    expect(() => auth.getUserId()).toThrow('User is not authenticated')
  })

  test('requestContext自体がない場合も認証されていない', () => {
    const event: any = {}
    const auth = AuthUserInfo.from(event)
    expect(auth.isAuthenticated()).toBe(false)
    expect(auth.isNotAuthenticated()).toBe(true)
    expect(() => auth.getUserId()).toThrow('User is not authenticated')
  })
})
