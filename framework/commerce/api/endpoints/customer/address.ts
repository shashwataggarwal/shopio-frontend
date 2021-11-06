import type { CustomerAddressSchema } from '../../../types/customer/address'
import type { GetAPISchema } from '../..'

import { CommerceAPIError } from '../../utils/errors'
import isAllowedOperation from '../../utils/is-allowed-operation'

const customerShippingEndpoint: GetAPISchema<
  any,
  CustomerAddressSchema
>['endpoint']['handler'] = async (ctx) => {
  const { req, res, handlers, config } = ctx

  if (
    !isAllowedOperation(req, res, {
      GET: handlers['getAddresses'],
      POST: handlers['addItem'],
      PUT: handlers['updateItem'],
      DELETE: handlers['removeItem'],
    })
  ) {
    return
  }

  const { cookies } = req

  // Cart id might be usefull for anonymous shopping
  const cartId = cookies[config.cartCookie]

  try {
    // Return customer addresses
    if (req.method === 'GET') {
      const body = { cartId }
      return await handlers['getAddresses']({ ...ctx, body })
    }

    // Create or add an item to customer addresses list
    if (req.method === 'POST') {
      const body = { ...req.body, cartId }
      return await handlers['addItem']({ ...ctx, body })
    }

    // Update item in customer addresses list
    if (req.method === 'PUT') {
      const body = { ...req.body, cartId }
      return await handlers['updateItem']({ ...ctx, body })
    }

    // Remove an item from customer addresses list
    if (req.method === 'DELETE') {
      const body = { ...req.body, cartId }
      return await handlers['removeItem']({ ...ctx, body })
    }
  } catch (error) {
    console.error(error)

    const message =
      error instanceof CommerceAPIError
        ? 'An unexpected error ocurred with the Commerce API'
        : 'An unexpected error ocurred'

    res.status(500).json({ data: null, errors: [{ message }] })
  }
}

export default customerShippingEndpoint
