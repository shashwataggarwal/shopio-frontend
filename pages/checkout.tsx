/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { CommerceProvider } from '@framework'
import { fetcher } from '@framework/fetcher'
import router, { useRouter } from 'next/router'

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

function CheckoutFlow() {
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

  // useEffect(() => {
  //   getActiveCustomer()
  // }, [])

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

function Test() {
  const router = useRouter()
  const [activeCustomerId, setActiveCustomerId] = useState()
  const [activeOrder, setActiveOrder] = useState()
  const [nextOrderStates, setNextOrderStates] = useState()
  const [shippingMethodId, setShippingMethodId] = useState()
  const [isAddressSet, setIsAddressSet] = useState(false)
  const [isTransitionSuccess, setIsTransitionSuccess] = useState(false)

  useEffect(
    () =>
      getData(ActiveCustomerQuery).then(({ activeCustomer }: any) => {
        if (!activeCustomer) {
          alert('Please sign in')
          router.push('/')
        } else setActiveCustomerId(activeCustomer.id)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (activeCustomerId)
      getData(ActiveOrderQuery).then(
        ({ activeOrder, nextOrderStates, eligibleShippingMethods }: any) => {
          if (!activeOrder || activeOrder?.totalWithTax == 0) {
            alert('Please create an order, cart is empty!')
            router.push('/cart')
          } else {
            setActiveOrder(activeOrder)
            setNextOrderStates(nextOrderStates)
            setShippingMethodId(eligibleShippingMethods[0].id)
          }
        }
      )
  }, [activeCustomerId])

  useEffect(() => {
    if (activeOrder && shippingMethodId && nextOrderStates) {
      const MutateOrderAdressQuery = getMutateOrderAdressQuery(shippingMethodId)
      getData(MutateOrderAdressQuery).then(
        ({ setOrderBillingAddress, setOrderShippingAddress }: any) => {
          let isSuccess = true
          // console.log('Order Address', res)
          // for (const data in res) {
          //   if (res[data].state != 'Order') {
          //     alert('Error! Address is not set!!')
          //     isSuccess = false
          //     break
          //   }
          // }
          if (
            setOrderBillingAddress.state == 'AddingItems' ||
            setOrderShippingAddress.state == 'AddingItems'
          ) {
            setIsAddressSet(isSuccess)
          } else if (
            setOrderBillingAddress.state == 'ArrangingPayment' ||
            setOrderShippingAddress.state == 'ArrangingPayment'
          ) {
            setIsTransitionSuccess(true)
          } else {
            alert('Error! Please try again! Clearing cart...')
            clearCart(router)
          }
        }
      )
    }
  }, [activeOrder, shippingMethodId, nextOrderStates])

  useEffect(() => {
    if (isAddressSet && Array.isArray(nextOrderStates)) {
      if (nextOrderStates.includes('ArrangingPayment')) {
        getData(TransitionOrderQuery).then(
          ({ transitionOrderToState }: any) => {
            if (transitionOrderToState.state != 'ArrangingPayment') {
              alert('Error! Order is wrong!! Clearing cart...')
              clearCart(router)
            } else {
              setIsTransitionSuccess(true)
            }
          }
        )
      }
    }
  }, [isAddressSet, nextOrderStates])

  useEffect(() => {
    if (isTransitionSuccess) {
      const RazorpayOrderIdQuery = getRazorpayOrderIdQuery(activeOrder.id)
      getData(RazorpayOrderIdQuery).then(({ generateRazorpayOrderId }: any) => {
        if (generateRazorpayOrderId.__typename == 'RazorpayOrderIdSuccess') {
          displayRazorpay()
        } else {
          alert('Error! Please try again! Clearing cart...')
          clearCart(router)
        }
      })
    }
  }, [isTransitionSuccess])

  async function RazorPayOP(query: any) {
    const { addPaymentToOrder } = await fetcher({ query })
    alert(`Your payment status is: ${addPaymentToOrder.state}`)
    if (addPaymentToOrder.state == 'PaymentSettled') router.push('/')
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

  return <h1>HELLO</h1>
}

export default function Checkout() {
  return (
    <CommerceProvider>
      <Test />
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

const ActiveCustomerQuery = `
  query {
    activeCustomer {
      id
    }
  }
`

const ActiveOrderQuery = `
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
    nextOrderStates
    eligibleShippingMethods {
      id
    }
  }
`

const getMutateOrderAdressQuery = (
  shippingMethodId: any,
  streetLine1 = 'IIIT Delhi'
) => `
        mutation {
          setOrderShippingAddress(
            input: { streetLine1: "${streetLine1}", countryCode: "IN" }
          ) {
            __typename
            ...on Order {
              state
            }
            ...on ErrorResult {
              message
            }
          }
         setOrderBillingAddress(
              input: { streetLine1: "${streetLine1}", countryCode: "IN" }
            ) {
              __typename
              ...on Order {
                state
              }
              ...on ErrorResult {
                message
              }
            }
          setOrderShippingMethod(shippingMethodId: ${shippingMethodId}) {
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

const TransitionOrderQuery = `
      mutation {
        transitionOrderToState(state: "ArrangingPayment") {
          __typename
          ...on Order {
            state
          }
          ...on ErrorResult {
            message
          }
        }
      }`

function getData(query: string) {
  return fetcher({ query })
}

function clearCart(router) {
  const query = `
    mutation {
      transitionOrderToState(state: "Cancelled") {
        __typename
        ... on Order {
          state
        }
        ... on ErrorResult {
          message
        }
      }
    }
  `
  getData(query).then((res) => {
    router.push('/')
  })
}

const getRazorpayOrderIdQuery = (orderId: any) => `
        mutation {
          generateRazorpayOrderId(orderId: ${orderId}) {
            __typename
          }
        }
      `
