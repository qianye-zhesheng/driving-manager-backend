import { DateNumber } from '../../../../src/domains/session/date-number'

describe('DateNumberのテスト', () => {
  test('YYYY-MM-DDでない形式で初期化すると例外を投げること', () => {
    expect(() => {
      DateNumber.of('2025-1-1')
    }).toThrow('dateString is not the format of YYYY-MM-DD')
  })

  test('YYYY-MM-DD形式で初期化すると例外を投げないこと', () => {
    expect(() => {
      DateNumber.of('2025-01-01')
    }).not.toThrow(Error)
  })

  test('getでYYYYMMDDを返すこと', () => {
    const result = DateNumber.of('2025-01-01').get()
    expect(result).toBe(20250101)
  })

  test('Date型から初期化してgetでYYYYMMDDを返すこと', () => {
    const date = new Date(2025, 0, 1) // 月は0始まり
    const result = DateNumber.at(date).get()
    expect(result).toBe(20250101)
  })
})
