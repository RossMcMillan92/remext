# Remext

This is an experiment in mimicking the action/loader pattern from Remix 🔥. This allows co-location of UI, and data reads and writes. The pattern also makes it very easy to write code that isn't reliant on client-side JavaScript being enabled.

Note, this doesn't mirror the API exactly. It is very basic and will undoubtedly have bugs.

## Example

```js
// pages/index.js

import Head from 'next/head'
import { json, redirect, withRemext } from 'remext/server'
import { Form, useActionData } from 'remext'

export default function Home({ name }) {
  const actionData = useActionData()

  return (
    <div>
      <Head>
        <title>{actionData.errorMessage ? 'Error: ' : ''}Remext</title>
      </Head>

      <main>
        <h1>
          Welcome to <a href="https://nextjs.org">{name}!(?)</a>
        </h1>

        {actionData.errorMessage ? (
          <p style={{ color: 'red' }}>{actionData.errorMessage}</p>
        ) : null}

        <Form encType="multipart/form-data">
          <p>
            <label>
              What's better when broken? <input name="answer" />
            </label>
          </p>
          <button type="submit">Submit</button>
        </Form>
      </main>
    </div>
  )
}

const action = ({ body, req, res }) => {
  const { answer } = body

  if (answer.toLowerCase() === 'egg') {
    return redirect('/success', true)
  }
  return json({
    errorMessage: 'Wrong! Hint: how do you like them in the morning?',
  })
}

const loader = async () => {
  return { props: { name: 'Remext' } }
}

export const getServerSideProps = withRemext(action, loader)
```

```js
// pages/_app.js

import { createContext, useContext, useState } from 'react'
import { ActionDataContextProvider } from 'remext'

function MyApp({ Component, pageProps: { ...pageProps } = {} }) {
  return (
    <ActionDataContextProvider pageProps={pageProps} Component={Component} />
  )
}

export default MyApp
```
