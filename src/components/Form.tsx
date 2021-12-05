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
  action,
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
    const actionUrl = action ?? document.location.pathname
    const response = await fetch(
      new Request(actionUrl, {
        body: new FormData(event.target as HTMLFormElement),
        headers: { 'x-fetch': 'true' },
        method,
      })
    )

    if ([307, 308].includes(response.status)) {
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
      method={method}
      onSubmit={onSubmit}
      encType="multipart/form-data"
      {...props}
    >
      {children}
    </form>
  )
}
