import { AppInitialProps } from 'next/app'
import { AppContextType } from 'next/dist/shared/lib/utils'
import React, { Dispatch } from 'react'
import { JSONSerializable } from '../utils/types'

type PageProps = AppInitialProps['pageProps']

const RemextContext = React.createContext<
  [JSONSerializable, Dispatch<JSONSerializable>]
>([{}, () => {}])

type RemextContextProviderProps = {
  pageProps: PageProps
} & (
  | {
      children: (props: PageProps) => React.ReactElement
      Component?: never
    }
  | {
      children?: never
      Component: AppContextType['Component']
    }
)
type RemextContextProvider = (
  props: RemextContextProviderProps
) => React.ReactElement

export const RemextContextProvider: RemextContextProvider = ({
  Component,
  children: childrenProp,
  pageProps: { __ACTION_DATA__, ...pageProps },
}) => {
  const [value, setValue] = React.useState<JSONSerializable>(
    __ACTION_DATA__ ?? {}
  )
  const children = Component
    ? (props: PageProps) => <Component {...props} />
    : childrenProp

  return (
    <RemextContext.Provider value={[value, setValue]}>
      {children?.(pageProps)}
    </RemextContext.Provider>
  )
}

/** @internal */
export const _useActionDataSetter = () => React.useContext(RemextContext)

export const useActionData = () => React.useContext(RemextContext)?.[0] ?? {}
