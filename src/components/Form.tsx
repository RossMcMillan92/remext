import { useRouter } from 'next/router'
import React from 'react'
import { _useActionDataSetter } from './ActionDataContext'

type FormProps = {
  action?: string
  children?: React.ReactNode
  method?: string
  onError?: (response: Response) => void
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
  const actionUrl = addActionQueryParam(action)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const actionUrl = addActionQueryParam(action ?? document.location.pathname)
    const response = await fetch(
      new Request(actionUrl, {
        body: new FormData(event.target as HTMLFormElement),
        headers: { 'x-fetch': 'true' },
        method,
      })
    )

    if ([301, 302, 307, 308].includes(response.status)) {
      router.push((await response.json()).__REDIRECT_LOCATION__)
      return
    }

    if (response.ok) {
      setActionData((await response.json()).__ACTION_DATA__)
      return
    }

    if (onError) {
      onError(response)
    } else {
      throw new Error(response.statusText)
    }
  }

  return (
    <form
      action={actionUrl}
      method={method}
      onSubmit={onSubmit}
      encType="multipart/form-data"
      {...props}
    >
      {children}
    </form>
  )
}

const addActionQueryParam = (action: string) =>
  `${action}${action.includes('?') ? '&' : '?'}__a`
