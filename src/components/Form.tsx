import { useRouter } from 'next/router'
import React from 'react'
import { _useActionDataSetter } from './RemextContext'

type FormProps = {
  action?: string
  children?: React.ReactNode
  onError?: (error: Error, response?: Response) => void
} & React.FormHTMLAttributes<HTMLFormElement>

type Form = (props: FormProps) => React.ReactElement

export const Form: Form = ({
  action = '',
  children,
  method: methodProp = 'POST',
  onError,
  ...props
}) => {
  const router = useRouter()
  const [, setActionData] = _useActionDataSetter()
  const method = methodProp.toUpperCase()

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const actionUrl = new URL(action, document.location.origin).toString()
    const { data: response, error } = await fetch(
      new Request(actionUrl, {
        body: new URLSearchParams(
          (new FormData(event.target as HTMLFormElement) as unknown) as string
        ).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'x-fetch': 'true',
        },
        method,
      })
    )
      .then(data => ({ data, error: undefined }))
      .catch((error: Error) => ({ data: undefined, error }))

    if (error) {
      if (onError) {
        onError(error)
      } else {
        throw new Error(error.message)
      }
      return
    }

    if (!response) return

    const { __REDIRECT_LOCATION__, __ACTION_DATA__ } = await response.json()

    if (
      [301, 302, 303, 304, 305, 306, 307, 308, 309].includes(response.status)
    ) {
      router.push(__REDIRECT_LOCATION__)
      return
    }

    if (response.ok) {
      setActionData(__ACTION_DATA__)
      return
    }

    const responseError = new Error(response.statusText)
    if (onError) {
      onError(responseError, response)
    } else {
      throw responseError
    }
  }

  return (
    <form
      action={action}
      method={method}
      onSubmit={onSubmit}
      encType="application/x-www-form-urlencoded"
      {...props}
    >
      {children}
    </form>
  )
}
