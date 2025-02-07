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

export async function fetchData({ url, method = 'GET', payload }: FetchProps) {
  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'ew3fs2xds653xPvb342sda',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  }

  const response = await fetch(`https://w1pr1uoehk.execute-api.us-east-1.amazonaws.com/api/v1${url}`, options)

  if (response.status === 429) {
    throw new RateLimitError('Rate limit exceeded. Stopping further requests.')
  }

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.errorMessage || `HTTP Error: ${response.status}`)
  }

  return response.json()
}

