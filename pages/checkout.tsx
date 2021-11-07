import React, { useEffect, useState } from 'react'
import { GraphQLClient, gql } from 'graphql-request'
import { CommerceProvider } from '@framework'
import { fetcher } from '@framework/fetcher'
import next from 'next'

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

function Sudip() {
  const [orderId, setOrderId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [nextOrderStates, setNextOrderStates] = useState([])
  const [razorpayOrderId, setRazorpayOrderId] = useState('')

  useEffect(() => {
    async function getData() {
      const query = `query {
        activeOrder {
          id
          code
        }
        activeCustomer {
          id
          name
          email
        }
        nextOrderStates
      }`
      const res = await fetcher({ query })
      console.log(res)
      setOrderId(res.activeOrder.id)
      // setCustomerId(res.activeCustomer.id)
      // setNextOrderStates(res.nextOrderStates)
    }
    getData()
  }, [])

  useEffect(() => {
    if (orderId) {
      // const query = `
      //   mutation {
      //     setOrderShippingAddress(
      //       input: { streetLine1: "K-20, Saket", countryCode: "IN" }
      //     ) {
      //       __typename
      //     }
      //    setOrderBillingAddress(
      //         input: { streetLine1: "K-20, Saket", countryCode: "IN" }
      //       ) {
      //         __typename
      //       }
      //     setOrderShippingMethod(shippingMethodId: 1) {
      //       __typename
      //     }
      //   }
      // `
      // const query = `
      // mutation {
      //   transitionOrderToState(state: "${nextOrderStates[0]}") {
      //     __typename,
      //   }
      // }
      // `
      const query = `
        mutation {
          generateRazorpayOrderId(orderId: ${orderId}) {
            __typename
          }
        }
      `
      async function getData() {
        const res = await fetcher({ query })
        console.log(res)
      }
      getData()
    }
  }, [orderId])

  useEffect(() => {
    const query = `
      query {
        activeOrder {
          id
          code
          customFields {
            razorpay_order_id
          }
        }
      }
    `
    async function getData() {
      const res = await fetcher({ query })
      console.log('ORDER ID', res)
      // setRazorpayOrderId(res.activeOrder.customFields.razorpay_order_id)
    }
    getData()
  }, [])

  async function RazorPayOP(query: any) {
    const res = await fetcher({ query })
    console.log(res)
  }
  async function displayRazorpay() {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?')
      return
    }

    const query = `
      query {
        activeOrder {
          id
          code
          state
          shippingAddress {
            streetLine1
          }
          currencyCode
          payments {
            id
          }

          customFields {
            razorpay_order_id
          }
          totalWithTax
        }
      }
    `

    const { activeOrder: data } = await fetcher({ query })

    console.log(data)

    const options = {
      key: 'rzp_test_4kRSTgXyUa5OIh',
      currency: data.currencyCode,
      amount: data.totalWithTax.toString(),
      order_id: data.customFields.razorpay_order_id,
      name: 'Donation',
      description: 'Thank you for nothing. Please give us some money',
      handler: function (response: {
        razorpay_payment_id: any
        razorpay_order_id: any
        razorpay_signature: any
      }) {
        // alert(response.razorpay_payment_id)
        // alert(response.razorpay_order_id)
        // alert(response.razorpay_signature)
        // const metadata = JSON.stringify({
        //   razorpay_payment_id: response.razorpay_payment_id,
        //   razorpay_signature: response.razorpay_signature,
        // })
        const query = `
          mutation {
            addPaymentToOrder(
              input: {
                method: "razorpay"
                metadata: { razorpay_payment_id: "${response.razorpay_payment_id}", razorpay_signature: "${response.razorpay_signature}" }
              }
            ) {
              __typename
              ...on Order {
                state
              }
              ...on ErrorResult {
                message
              }
            }
          }
        `
        RazorPayOP(query)
      },
    }

    const paymentObject = new (window as any).Razorpay(options)
    paymentObject.open()
  }
  return (
    <div>
      <h1>Checkout</h1>
      <button onClick={displayRazorpay}>Pay</button>
    </div>
  )
}

export default function Checkout() {
  return (
    <CommerceProvider>
      <Sudip />
    </CommerceProvider>
  )
}

const flow = {
  1: 'check active customer - if not then force sign in',
  2: 'get shipping method id',
  3: 'set address and shipping method id',
  4: 'check if arranging payments is in nextstates - if so then transition to this state',
  5: 'generate razorpay orderid',
  6: 'open razorpay payment',
  7: 'success ? home : error',
}
