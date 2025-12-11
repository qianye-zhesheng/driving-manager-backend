import { Year } from '../../../../../src/domains/session/monthly/year'

describe('Yearのテスト', () => {
  test('undefinedで初期化すると例外を投げること', () => {
    expect(() => {
      Year.of(undefined)
    }).toThrow('year is required')
  })

  test('空文字で初期化すると例外を投げること', () => {
    expect(() => {
      Year.of('')
    }).toThrow('year must be a 4-digit number string')
  })

  test('数値でない文字列で初期化すると例外を投げること', () => {
    expect(() => {
      Year.of('abcd')
    }).toThrow('year must be a 4-digit number string')

    expect(() => {
      Year.of('200.1')
    }).toThrow('year must be a 4-digit number string')
  })

  test('不正な年度で初期化すると例外を投げること', () => {
    expect(() => {
      Year.of('1899')
    }).toThrow('year must be between 1900 and 2100')

    expect(() => {
      Year.of('2101')
    }).toThrow('year must be between 1900 and 2100')
  })

  test('正しい年度で初期化すると例外を投げないこと', () => {
    expect(() => {
      Year.of('1900')
    }).not.toThrow(Error)

    expect(() => {
      Year.of('2100')
    }).not.toThrow(Error)
  })

  test('getで年度を返すこと', () => {
    const result = Year.of('2025').get()
    expect(result).toBe(2025)
  })
})
