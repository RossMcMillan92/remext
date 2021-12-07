import { json, redirect } from './withRemext'

describe('json', () => {
  it('returns the correct shape', () => {
    expect(json({ prop: 'value' })).toEqual({
      props: { __ACTION_DATA__: { prop: 'value' } },
    })
  })
})

describe('redirect', () => {
  it('returns the correct shape', () => {
    expect(redirect('/path', 307)).toEqual({
      redirect: { destination: '/path', statusCode: 307 },
    })
  })
})
