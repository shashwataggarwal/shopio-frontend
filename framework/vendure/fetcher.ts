import { Fetcher } from '@commerce/utils/types'
import { FetcherError } from '@commerce/utils/errors'
import axios from 'axios'
import https from 'https'

async function getText(res: Response) {
  try {
    return (await res.text()) || res.statusText
  } catch (error) {
    return res.statusText
  }
}

async function getError(res: Response) {
  if (res.headers.get('Content-Type')?.includes('application/json')) {
    const data = await res.json()
    return new FetcherError({ errors: data.errors, status: res.status })
  }
  return new FetcherError({ message: await getText(res), status: res.status })
}

export const fetcher: Fetcher = async ({
  url,
  method = 'POST',
  variables,
  query,
  body: bodyObj,
}) => {
  const shopApiUrl =
    process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL ||
    process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL
  console.log('HEYO')
  if (!shopApiUrl) {
    throw new Error(
      'The Vendure Shop API url has not been provided. Please define NEXT_PUBLIC_VENDURE_SHOP_API_URL in .env.local'
    )
  }
  const hasBody = Boolean(variables || query)
  const body = hasBody ? JSON.stringify({ query, variables }) : undefined
  const headers = hasBody ? { 'Content-Type': 'application/json' } : undefined

  const res = await axios({
    url: process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL,
    method,
    headers,
    data: JSON.parse(body),
    withCredentials: true,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  })

  // const res = await fetch(shopApiUrl, {
  //   method,
  //   body,
  //   headers,
  //   credentials: 'include',
  // })
  console.log('RES AXIOS', res)
  if (res.statusText == 'OK') {
    const { data, errors } = res.data
    if (errors) {
      throw await new FetcherError({ status: res.status, errors })
    }
    return data
  }
  // if (res.ok) {
  //   const { data, errors } = await res.json()
  //   if (errors) {
  //     throw await new FetcherError({ status: res.status, errors })
  //   }
  //   return data
  // }

  throw await getError(res)
}
