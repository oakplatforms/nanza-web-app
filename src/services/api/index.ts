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

// Guest token cache
let guestTokenCache: { token: string; expiresAt: number } | null = null

async function getGuestToken(): Promise<string | null> {
  // Check if we have a valid cached guest token
  if (guestTokenCache && guestTokenCache.expiresAt > Date.now()) {
    return guestTokenCache.token
  }

  // First, check if there's a hardcoded guest token in environment
  const hardcodedGuestToken = process.env.REACT_APP_GUEST_TOKEN
  if (hardcodedGuestToken) {
    // Cache it with a long expiration (24 hours)
    guestTokenCache = { 
      token: hardcodedGuestToken, 
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 
    }
    return hardcodedGuestToken
  }

  // Otherwise, try to fetch from API endpoint
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || ''
    // Get guest token endpoint from env or use default
    // Note: guest token endpoint is at /user/guest-token (not /api/v1/user/guest-token)
    const guestTokenEndpoint = process.env.REACT_APP_GUEST_TOKEN_ENDPOINT || '/user/guest-token'
    const fullUrl = guestTokenEndpoint.startsWith('http') 
      ? guestTokenEndpoint 
      : `${baseUrl}${guestTokenEndpoint}`
    
    console.log('Fetching guest token from:', fullUrl)
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      // Support different response formats
      const token = data.token || data.accessToken || data.access_token
      // Cache the token (expiresIn in seconds, default to 1 hour)
      const expiresInSeconds = data.expiresIn || data.expires_in || 3600
      const expiresAt = Date.now() + expiresInSeconds * 1000
      guestTokenCache = { token, expiresAt }
      console.log('Guest token obtained and cached')
      return token
    } else {
      console.warn('Failed to get guest token, status:', response.status)
    }
  } catch (error) {
    console.warn('Failed to get guest token:', error)
  }

  return null
}

async function getJwtToken(): Promise<string | null> {
  // First try to get authenticated user token
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.accessToken?.toString()
    if (token) {
      return token
    }
  } catch (error) {
    // User is not authenticated, continue to guest token
  }

  // If no authenticated token, try guest token
  return await getGuestToken()
}

export async function fetchData({ url, method = 'GET', payload }: FetchProps) {
  const token = await getJwtToken()

  const isFormData = payload instanceof FormData

  const options: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: payload
      ? isFormData
        ? payload
        : JSON.stringify(payload)
      : undefined,
  }

  const baseUrl = process.env.REACT_APP_API_BASE_URL || ''
  const response = await fetch(`${baseUrl}/api/v1${url}`, options)

  if (response.status === 429) {
    throw new RateLimitError('Rate limit exceeded. Stopping further requests.')
  }

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { errorMessage: `HTTP Error: ${response.status}` }
    }
    const error = new Error(errorData.errorMessage || `HTTP Error: ${response.status}`)
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}

