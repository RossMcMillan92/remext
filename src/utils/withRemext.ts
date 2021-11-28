import multiparty from 'multiparty'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { JSONSerializable } from './types'

type GetServerSidePropsContextWithBody = GetServerSidePropsContext & {
  body: {
    [x: string]: string | string[] | multiparty.File | multiparty.File[]
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
  const form = new multiparty.Form()

  return new Promise((resolve, reject) => {
    form.parse(
      ctx.req,
      async (
        err,
        fields: { [x: string]: string[] },
        files: { [x: string]: string[] }
      ) => {
        if (err) {
          reject(err)
          return
        }

        const body = Object.fromEntries(
          Object.entries({
            ...fields,
            ...files,
          }).map(([key, value]) => [key, value.length === 1 ? value[0] : value])
        )
        const { __statusCode, ...actionResult } = ((await action({
          ...ctx,
          body,
        })) ?? {}) as RemextActionDataProps

        const isFetch = ctx.req.headers['x-fetch']
        const redirect = ((actionResult as unknown) as RemextRedirectProps)
          ?.__redirect

        if (redirect && isFetch) {
          const statusCode = redirect.permanent ? 308 : 307
          ctx.res.writeHead(statusCode, { 'Content-Type': 'application/json' })
          ctx.res.end(
            JSON.stringify({ __REDIRECT_LOCATION__: redirect.destination })
          )
          resolve({ props: {} })
          return
        }

        if (redirect) {
          resolve({ redirect })
          return
        }

        if (isFetch) {
          ctx.res.writeHead(__statusCode, {
            'Content-Type': 'application/json',
          })
          ctx.res.end(JSON.stringify(actionResult.props))
          resolve({ props: {} })
          return
        }

        const loaderResult = ((await loader?.(ctx)) ?? {}) as {
          props: Record<string, JSONSerializable>
        }
        resolve({
          ...loaderResult,
          props: {
            ...loaderResult.props,
            ...((actionResult as RemextActionDataProps).props
              ? (actionResult as RemextActionDataProps).props
              : actionResult),
          },
        })
        return
      }
    )
  })
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
  __redirect: { destination: string; permanent: boolean }
}
type redirect = (location: string, permanent?: boolean) => RemextRedirectProps
export const redirect: redirect = (location, permanent = false) => {
  return { __redirect: { destination: location, permanent } }
}
