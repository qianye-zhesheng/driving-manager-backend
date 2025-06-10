import { CorsHeaders } from '../../../src/config/cors-headers'

describe('CorsHeadersのテスト', () => {
  const ORIGINAL_ENV = process.env
  beforeAll(() => {
    jest.resetModules() // モジュールのキャッシュをクリア
    process.env = { ...ORIGINAL_ENV } // 環境変数のコピーを作る
    process.env.ALLOW_ORIGIN = "'http://localhost:5173'"
    process.env.ALLOW_METHODS = "'GET,POST,PUT,DELETE,OPTIONS'"
    process.env.ALLOW_HEADERS = "'Content-Type,Authorization'"
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV // 環境変数を元に戻す
  })

  test('前提として、テスト用環境変数が正しく設定されていること', () => {
    expect(process.env.ALLOW_ORIGIN).toBe("'http://localhost:5173'")
    expect(process.env.ALLOW_METHODS).toBe("'GET,POST,PUT,DELETE,OPTIONS'")
    expect(process.env.ALLOW_HEADERS).toBe("'Content-Type,Authorization'")
  })

  test('CorsHeaders.get()が正しいヘッダーを返すこと', () => {
    const expectedHeaders = {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    }
    expect(CorsHeaders.get()).toEqual(expectedHeaders)
  })
})
