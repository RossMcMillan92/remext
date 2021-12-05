import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { JSONSerializable } from './types'
import parse from 'urlencoded-body-parser'

type GetServerSidePropsContextWithBody = GetServerSidePropsContext & {
  body: {
    [x: string]: string | string[]
  }
}

type withRemext = (
  action: (
    ctx: GetServerSidePropsContextWithBody
  ) => Promise<
    ReturnType<json> | ReturnType<redirect> | { [x: string]: JSONSerializable }
  >,
  loader: GetServerSideProps
) => (ctx: GetServerSidePropsContext) => Promise<any>

export const withRemext: withRemext = (action, loader) => async ctx => {
  if (ctx.req.method === 'GET') return loader(ctx)

  const body = (await parse(ctx.req)) as { [x: string]: string }
  console.log('🚀 ~ file: withRemext.ts ~ line 25 ~ body', body)

  const { __statusCode, ...actionResult } = ((await action({
    ...ctx,
    body,
  })) ?? {}) as RemextActionDataProps

  const isFetch = ctx.req.headers['x-fetch']
  const redirect = ((actionResult as unknown) as RemextRedirectProps)?.redirect

  if (redirect && isFetch) {
    ctx.res.writeHead(redirect.statusCode, {
      'Content-Type': 'application/json',
    })
    ctx.res.end(JSON.stringify({ __REDIRECT_LOCATION__: redirect.destination }))
    return { props: {} }
  }

  if (redirect) {
    return {
      redirect: { destination: redirect.destination, statusCode: 302 },
    }
  }

  if (isFetch) {
    ctx.res.writeHead(__statusCode, {
      'Content-Type': 'application/json',
    })
    ctx.res.end(JSON.stringify(actionResult.props))
    return { props: {} }
  }

  const loaderResult = ((await loader?.(ctx)) ?? {}) as {
    props: Record<string, JSONSerializable>
  }
  return {
    ...loaderResult,
    props: {
      ...loaderResult.props,
      ...((actionResult as RemextActionDataProps).props
        ? (actionResult as RemextActionDataProps).props
        : actionResult),
    },
  }
}

type RemextActionDataProps = {
  props: { __ACTION_DATA__: JSONSerializable }
  __statusCode: number
}
type json = (
  body: JSONSerializable,
  statusCode?: number
) => RemextActionDataProps
export const json: json = (body, statusCode = 200) => {
  return { props: { __ACTION_DATA__: body }, __statusCode: statusCode }
}

type RemextRedirectProps = {
  redirect: { destination: string; statusCode: number }
}
type redirect = (
  location: string,
  statusCode?: 301 | 302
) => RemextRedirectProps
export const redirect: redirect = (location, statusCode = 302) => {
  return { redirect: { destination: location, statusCode } }
}
