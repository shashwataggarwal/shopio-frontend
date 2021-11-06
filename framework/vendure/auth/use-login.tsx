import { useCallback } from 'react'
import { MutationHook } from '@commerce/utils/types'
import useLogin, { UseLogin } from '@commerce/auth/use-login'
import { LoginHook } from '../types/login'
import { CommerceError, ValidationError } from '@commerce/utils/errors'
import useCustomer from '../customer/use-customer'
import { LoginMutation, LoginMutationVariables } from '../schema'
import { loginMutation } from '../utils/mutations/log-in-mutation'

export default useLogin as UseLogin<typeof handler>

export const handler: MutationHook<LoginHook> = {
  fetchOptions: {
    query: loginMutation,
  },
  async fetcher({
    input: { auth_token, phone_token, phone_number },
    options,
    fetch,
  }) {
    if (!(auth_token && phone_token && phone_number)) {
      throw new CommerceError({
        message: 'All token and phone number are required to login',
      })
    }

    const variables: LoginMutationVariables = {
      auth_token,
      phone_token,
      phone_number,
    }

    console.log('variables', variables)

    const res = await fetch<LoginMutation>({
      ...options,
      variables,
    })
    const { authenticate } = res
    if (authenticate.__typename !== 'CurrentUser') {
      throw new ValidationError(authenticate)
    }

    return null
  },
  useHook:
    ({ fetch }) =>
    () => {
      const { revalidate } = useCustomer()

      return useCallback(
        async function login(input) {
          const data = await fetch({ input })
          await revalidate()
          return data
        },
        [fetch, revalidate]
      )
    },
}
