import { AppInitialProps } from 'next/app'
import { AppContextType } from 'next/dist/shared/lib/utils'
import React, { Dispatch } from 'react'
import { JSONSerializable } from '../utils/types'

type PageProps = AppInitialProps['pageProps']

const ActionDataContext = React.createContext<
  [JSONSerializable, Dispatch<JSONSerializable>]
>([{}, () => {}])

type ActionDataContextProviderProps = {
  pageProps: PageProps
} & (
  | {
      children: (props: PageProps) => React.ReactElement
      Component?: AppContextType['Component']
    }
  | {
      children?: (props: AppInitialProps['pageProps']) => React.ReactElement
      Component: AppContextType['Component']
    }
)
type ActionDataContextProvider = (
  props: ActionDataContextProviderProps
) => React.ReactElement

export const ActionDataContextProvider: ActionDataContextProvider = ({
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
    <ActionDataContext.Provider value={[value, setValue]}>
      {children?.(pageProps)}
    </ActionDataContext.Provider>
  )
}

export const _useActionDataSetter = () => React.useContext(ActionDataContext)

export const useActionData = () =>
  React.useContext(ActionDataContext)?.[0] ?? {}
