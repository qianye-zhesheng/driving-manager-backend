import { Month } from '../../../../../src/domains/session/monthly/month'

describe('Monthのテスト', () => {
  test('undefinedで初期化すると例外を投げること', () => {
    expect(() => {
      Month.of(undefined)
    }).toThrow('month is required')
  })

  test('空文字で初期化すると例外を投げること', () => {
    expect(() => {
      Month.of('')
    }).toThrow('month must be a numeric string')
  })

  test('数値でない文字列で初期化すると例外を投げること', () => {
    expect(() => {
      Month.of('abc')
    }).toThrow('month must be a numeric string')

    expect(() => {
      Month.of('12.5')
    }).toThrow('month must be an integer between 1 and 12')
  })

  test('範囲外の月で初期化すると例外を投げること', () => {
    expect(() => {
      Month.of('0')
    }).toThrow('month must be an integer between 1 and 12')

    expect(() => {
      Month.of('13')
    }).toThrow('month must be an integer between 1 and 12')

    expect(() => {
      Month.of('-1')
    }).toThrow('month must be an integer between 1 and 12')
  })

  test('正しい月で初期化すると例外を投げないこと', () => {
    expect(() => {
      Month.of('1')
    }).not.toThrow(Error)

    expect(() => {
      Month.of('12')
    }).not.toThrow(Error)

    expect(() => {
      Month.of('6')
    }).not.toThrow(Error)
  })

  test('getで月を返すこと', () => {
    expect(Month.of('1').get()).toBe(1)
    expect(Month.of('12').get()).toBe(12)
    expect(Month.of('6').get()).toBe(6)
  })
})
