import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from './Form'
import React from 'react'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { RemextContextProvider, useActionData } from '..'

const mockRouter = { push: jest.fn() }
jest.mock('next/router', () => ({ useRouter: () => mockRouter }))

export const server = setupServer(
  rest.post('http://localhost/', (req, res, ctx) => {
    return res(ctx.json({ __ACTION_DATA__: { message: 'from server' } }))
  }),
  rest.post('http://localhost/redirect', (req, res, ctx) => {
    return res(
      ctx.status(302),
      ctx.json({ __REDIRECT_LOCATION__: '/redirect/path' })
    )
  }),
  rest.post('http://localhost/network-error', (req, res, ctx) => {
    return res.networkError('Something went wrong')
  }),
  rest.post('http://localhost/fetch-error', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json('Not found'))
  })
)

describe('Form', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders a form with children and the correct default props', () => {
    render(
      <Form data-testid="form">
        <input type="text" />
        <button type="submit">Submit</button>
      </Form>
    )

    const form = screen.getByTestId('form') as HTMLFormElement
    expect(form.action).toBe('http://localhost/')
    expect(form.tagName).toBe('FORM')
    expect(form.method).toBe('post')
    expect(form.getAttribute('enctype')).toBe(
      'application/x-www-form-urlencoded'
    )

    expect(screen.getByRole('textbox')).not.toBeNull()
    expect(screen.getByRole('button')).not.toBeNull()
  })

  it('overrides props when passed', () => {
    render(
      <Form data-testid="form" method="get" action="/some-url">
        <input type="text" />
        <button type="submit">Submit</button>
      </Form>
    )

    const form = screen.getByTestId('form') as HTMLFormElement
    expect(form.action).toBe('http://localhost/some-url')
    expect(form.tagName).toBe('FORM')
    expect(form.method).toBe('get')
  })

  it('submits and stores the action data', async () => {
    const Component = () => {
      const actionData = useActionData()
      return (
        <Form data-testid="form">
          <input type="text" />
          <button type="submit">Submit</button>
          {JSON.stringify(actionData)}
        </Form>
      )
    }
    render(<RemextContextProvider pageProps={{}} Component={Component} />)

    userEvent.click(screen.getByText('Submit'))

    expect(await screen.findByText('{"message":"from server"}')).not.toBeNull()
  })

  it('submits and redirects', async () => {
    render(
      <Form data-testid="form" action="/redirect">
        <input type="text" />
        <button type="submit">Submit</button>
      </Form>
    )

    userEvent.click(screen.getByText('Submit'))
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalled())

    expect(mockRouter.push).toHaveBeenCalledWith('/redirect/path')
  })

  it('catches network errors', async () => {
    const onError = jest.fn()
    render(
      <Form data-testid="form" action="/network-error" onError={onError}>
        <input type="text" />
        <button type="submit">Submit</button>
      </Form>
    )

    userEvent.click(screen.getByText('Submit'))
    await waitFor(() => expect(onError).toHaveBeenCalled())

    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    expect(onError.mock.calls[0][0].message).toBe(
      'request to http://localhost/network-error failed, reason: Something went wrong'
    )
  })

  it('catches fetch errors', async () => {
    const onError = jest.fn()
    render(
      <Form data-testid="form" action="/fetch-error" onError={onError}>
        <input type="text" />
        <button type="submit">Submit</button>
      </Form>
    )

    userEvent.click(screen.getByText('Submit'))
    await waitFor(() => expect(onError).toHaveBeenCalled())

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Response)
    )
    expect(onError.mock.calls[0][0].message).toBe('Not Found')
    expect(onError.mock.calls[0][1].status).toBe(404)
  })
})
