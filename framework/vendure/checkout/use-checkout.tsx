import { useCallback } from 'react'
import { SWRHook, MutationHook } from '@commerce/utils/types'
import useCheckout, { UseCheckout } from '@commerce/checkout/use-checkout'
import { CommerceError, ValidationError } from '@commerce/utils/errors'

const query = `mutation {
  generateRazorpayOrderId(orderId: $orderId) {
    __typename
  }
}`
export default useCheckout as UseCheckout<typeof handler>

export const handler: SWRHook<any> = {
  fetchOptions: {
    query: '',
  },
  async fetcher({ input, options, fetch }) {},
  useHook:
    ({ useData }) =>
    async (input) => ({}),
}

export const handler2: MutationHook<any> = {
  fetchOptions: {
    query: query,
  },
  async fetcher({ input: { orderId }, options, fetch }) {
    if (!orderId) {
      throw new CommerceError({
        message: 'All token and phone number are required to login',
      })
    }

    const variables: any = {
      orderId,
    }

    // console.log('variables', variables)

    const res = await fetch<any>({
      ...options,
      variables,
    })

    // console.log('Res checkout', res)

    return null
  },
  useHook:
    ({ fetch }) =>
    () => {
      return useCallback(
        async function order(input) {
          const data = await fetch({ input })
          return data
        },
        [fetch]
      )
    },
}
