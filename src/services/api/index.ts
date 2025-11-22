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

// Check if we should use the Vercel proxy (when deployed on Vercel)
function shouldUseProxy(): boolean {
  // Check environment variable first
  if (process.env.REACT_APP_USE_PROXY === 'true') {
    return true
  }
  if (process.env.REACT_APP_USE_PROXY === 'false') {
    return false
  }
  
  // Auto-detect: Use proxy when on Vercel (check for vercel environment)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    // Use proxy if we're on a Vercel domain (not localhost)
    return hostname.includes('vercel.app') && !hostname.includes('localhost')
  }
  
  // Default: don't use proxy (for local development)
  return false
}

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
    const useProxy = shouldUseProxy()
    let fullUrl: string
    
    if (useProxy) {
      // Use Vercel proxy for guest token
      fullUrl = '/user-proxy/guest-token'
    } else {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || ''
      // Get guest token endpoint from env or use default
      // Note: guest token endpoint is at /user/guest-token (not /api/v1/user/guest-token)
      const guestTokenEndpoint = process.env.REACT_APP_GUEST_TOKEN_ENDPOINT || '/user/guest-token'
      fullUrl = guestTokenEndpoint.startsWith('http') 
        ? guestTokenEndpoint 
        : `${baseUrl}${guestTokenEndpoint}`
    }
    
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

  const useProxy = shouldUseProxy()
  let fullUrl: string
  
  if (useProxy) {
    // Use Vercel proxy - requests go through same origin, no CORS issues
    fullUrl = `/api-proxy/v1${url}`
  } else {
    // Direct API call (for local development)
    const baseUrl = process.env.REACT_APP_API_BASE_URL || ''
    
    if (!baseUrl) {
      const error = new Error('API base URL is not configured. Please set REACT_APP_API_BASE_URL environment variable.')
      ;(error as any).status = 500
      throw error
    }

    fullUrl = `${baseUrl}/api/v1${url}`
  }
  
  // Add CORS mode and credentials (only needed for direct API calls)
  const fetchOptions: RequestInit = useProxy
    ? options // No CORS needed when using proxy
    : {
        ...options,
        mode: 'cors',
        credentials: 'omit', // Don't send cookies for CORS
      }
  
  let response: Response
  try {
    response = await fetch(fullUrl, fetchOptions)
  } catch (fetchError) {
    // Network error (CORS, connection refused, etc.)
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown network error'
    
    // Check if it's a CORS error
    const isCorsError = errorMessage.includes('CORS') || 
                       errorMessage.includes('cors') ||
                       errorMessage.includes('Failed to fetch') ||
                       errorMessage.includes('NetworkError')
    
    const apiBaseUrl = useProxy 
      ? 'API Gateway (via proxy)' 
      : (process.env.REACT_APP_API_BASE_URL || 'API Gateway')
    
    const error = new Error(
      isCorsError
        ? `CORS error: The API server at ${apiBaseUrl} is not allowing requests from this origin. Please configure CORS on your API Gateway to allow requests from ${typeof window !== 'undefined' ? window.location.origin : 'your Vercel domain'}.`
        : `Failed to fetch: ${errorMessage}. API URL: ${fullUrl}`
    )
    ;(error as any).status = 0
    ;(error as any).isNetworkError = true
    ;(error as any).isCorsError = isCorsError
    throw error
  }

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

