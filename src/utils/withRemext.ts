import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { JSONSerializable } from './types'
import parse from 'urlencoded-body-parser'

type GetServerSidePropsContextWithBody = GetServerSidePropsContext & {
  body: {
    [x: string]: string | string[]
  }
}

type withRemext = ({
  action,
  loader,
}: {
  action: (
    ctx: GetServerSidePropsContextWithBody
  ) => Promise<
    ReturnType<json> | ReturnType<redirect> | { [x: string]: JSONSerializable }
  >
  loader: GetServerSideProps
}) => (ctx: GetServerSidePropsContext) => Promise<any>

export const withRemext: withRemext =
  ({ action, loader }) =>
  async (ctx) => {
    if (ctx.req.method === 'GET') return loader?.(ctx) ?? { props: {} }

    const body = (await parse(ctx.req)) as { [x: string]: string }

    const actionResult = ((await action({ ...ctx, body })) ??
      {}) as RemextActionDataProps

    const isFetch = ctx.req.headers['x-fetch']
    const redirect = (actionResult as unknown as RemextRedirectProps)?.redirect

    if (redirect && isFetch) {
      ctx.res.writeHead(redirect.statusCode, {
        'Content-Type': 'application/json',
      })
      ctx.res.end(
        JSON.stringify({ __REDIRECT_LOCATION__: redirect.destination })
      )
      return { props: {} }
    }

    if (redirect) {
      return {
        redirect: { destination: redirect.destination, statusCode: 302 },
      }
    }

    if (isFetch) {
      ctx.res.writeHead(200, { 'Content-Type': 'application/json' })
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
}
type json = (
  body: JSONSerializable,
  statusCode?: number
) => RemextActionDataProps
export const json: json = (body) => ({
  props: { __ACTION_DATA__: body },
})

type RemextRedirectProps = {
  redirect: { destination: string; statusCode: number }
}
type redirect = (
  location: string,
  statusCode?: 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 309
) => RemextRedirectProps
export const redirect: redirect = (location, statusCode = 302) => ({
  redirect: { destination: location, statusCode },
})
