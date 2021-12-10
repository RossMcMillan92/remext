# Remext

This is an experiment in mimicking the action/loader pattern from Remix 🔥. This allows co-location of UI, data reads, and data writes. The pattern also makes it very easy to write code that isn't reliant on client-side JavaScript being enabled.

Don't think about the name too much; I certainly didn't.

Note, this doesn't mirror the API exactly. It uses Next's `getServerSideProps` without altering too much. It is experimental and will undoubtedly have bugs.

## Example

[Visit the live version of this example](https://remext-example.vercel.app/). Try disabling JavaScript too.

```js
// pages/index.js

import Head from 'next/head'
import { json, redirect, withRemext } from 'remext/server'
import { Form, useActionData } from 'remext'

export default function Home({ name }) {
  const actionData = useActionData()

  return (
    <main>
      <Head>
        <title>{actionData.errorMessage ? 'Error: ' : ''}Remext</title>
      </Head>

      <h1>Welcome to {name}!</h1>

      {actionData.errorMessage ? (
        <p style={{ color: 'red' }}>{actionData.errorMessage}</p>
      ) : null}

      <Form>
        <p>
          <label>
            What's better when broken? <input name="answer" />
          </label>
        </p>
        <button type="submit">Submit</button>
      </Form>
    </main>
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

export const getServerSideProps = withRemext({ action, loader })
```

```js
// pages/success.js

import Head from 'next/head'
import Link from 'next/link'
import { json, redirect, withRemext } from 'remext/server'

export default function Success() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-500 text-lg">
      <Head>
        <title>Success</title>
      </Head>

      <main className="flex flex-col py-44 w-full flex-1 px-20 items-center">
        <section className="bg-white p-8 rounded-lg shadow-2xl max-w-xl">
          <h1 className="text-2xl font-bold mb-8">Success</h1>
        </section>
        <Link href="/">home</Link>
      </main>
    </div>
  )
}
```

And a one-off to set things up:

```js
// pages/_app.js

import { createContext, useContext, useState } from 'react'
import { RemextContextProvider } from 'remext'

export default function MyApp({ Component, pageProps }) {
  return <RemextContextProvider pageProps={pageProps} Component={Component} />
}

// or

export default function MyApp({ Component, pageProps }) {
  return (
    <RemextContextProvider pageProps={pageProps}>
      {(props) => <Component {...props} />}
    </RemextContextProvider>
  )
}
```

## Troubleshooting

If you see errors regarding the `fs` module not being found, you may need to add the following
to your next.config.js:

```js
// next.config.js

module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
        },
      }
    }

    return config
  },
}
```
