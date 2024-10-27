type FetchProps = {
  url: string
  method?: string
  payload?: object
}

export async function fetchData({ url, method = 'GET', payload } : FetchProps) {
  try {
    const options = {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: payload && JSON.stringify(payload),
    }
    const response = await fetch(`https://w1pr1uoehk.execute-api.us-east-1.amazonaws.com/api/v1${url}`, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error);
  }
}