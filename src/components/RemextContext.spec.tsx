import { render, screen } from '@testing-library/react'
import React from 'react'

import { RemextContextProvider, useActionData } from '..'
import { JSONSerializable } from '../utils/types'

describe('Form', () => {
  it('allows access to the action data via context while stripping it from pageProps', async () => {
    const Component = (props: JSONSerializable) => {
      const actionData = useActionData()
      return (
        <>
          <div>Action data: {JSON.stringify(actionData)}</div>
          <div>pageProps: {JSON.stringify(props)}</div>
        </>
      )
    }
    const actionData = { prop: 'value' }
    render(
      <RemextContextProvider
        pageProps={{ __ACTION_DATA__: actionData, otherProp: 'value2' }}
        Component={Component}
      />
    )

    expect(screen.getByText('Action data: {"prop":"value"}')).not.toBeNull()
    expect(screen.getByText('pageProps: {"otherProp":"value2"}')).not.toBeNull()
  })

  it('allows children to be passed as a render prop', async () => {
    const Component = (props: JSONSerializable) => {
      const actionData = useActionData()
      return (
        <>
          <div>Action data: {JSON.stringify(actionData)}</div>
          <div>pageProps: {JSON.stringify(props)}</div>
        </>
      )
    }
    const actionData = { prop: 'value' }
    render(
      <RemextContextProvider
        pageProps={{ __ACTION_DATA__: actionData, otherProp: 'value2' }}
      >
        {(pageProps) => <Component {...pageProps} />}
      </RemextContextProvider>
    )

    expect(screen.getByText('Action data: {"prop":"value"}')).not.toBeNull()
    expect(screen.getByText('pageProps: {"otherProp":"value2"}')).not.toBeNull()
  })
})
