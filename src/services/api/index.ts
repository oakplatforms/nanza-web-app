import { fetchAuthSession } from '@aws-amplify/auth'

type FetchProps = {
  url: string
  method?: string
  payload?: object
}

class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

async function getJwtToken() {
  const session = await fetchAuthSession()
  return session.tokens?.accessToken?.toString() || null
}

export async function fetchData({ url, method = 'GET', payload }: FetchProps) {
  const token = await getJwtToken()

  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  }

  const response = await fetch(`/api/v1${url}`, options)

  if (response.status === 429) {
    throw new RateLimitError('Rate limit exceeded. Stopping further requests.')
  }

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.errorMessage || `HTTP Error: ${response.status}`)
  }

  return response.json()
}

