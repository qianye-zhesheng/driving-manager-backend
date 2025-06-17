import { ParamParser } from '../../../../src/domains/session/param-parser'
import eventPutStart from '../../../../events/session/event-put-start.json'
import invalidParams from './invalid-params.json'
import { SessionParam } from '../../../../src/domains/session/session-param'

describe('ParamParserのテスト', () => {
  test('validなparamなら例外を投げないこと', () => {
    expect(() => {
      ParamParser.from(eventPutStart.body).parse()
    }).not.toThrow(Error)
  })

  test('項目が一部足りないparamなら例外を投げること', () => {
    invalidParams.missingContents.forEach((param) => {
      const body = JSON.stringify(param)
      expect(() => {
        ParamParser.from(body).parse()
      }).toThrow('param is invalid')
    })
  })

  test('parseされた内容がSessionParamの型であること', () => {
    const SessionParam: SessionParam = ParamParser.from(eventPutStart.body).parse()
    expect(SessionParam).toHaveProperty('userId', 'user123')
    expect(SessionParam).toHaveProperty('date', '2025-01-01')
    expect(SessionParam).toHaveProperty('odometer', 10000)
  })
})
