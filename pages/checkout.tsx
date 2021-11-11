/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { CommerceProvider } from '@framework'
import { fetcher } from '@framework/fetcher'
import { useRouter } from 'next/router'
import { DisappearedLoading } from 'react-loadingg'
import Swal from 'sweetalert2'

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

function showAlert({
  title = 'Error',
  text = 'There was an error',
  icon = 'error',
  allowOutsideClick = false,
  callback = () => {},
} = {}) {
  return Swal.fire({ title, text, icon, allowOutsideClick, callback }).then(
    ({ isConfirmed }) => {
      if (isConfirmed) {
        callback()
      }
    }
  )
}

function CheckoutFlow() {
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
          // alert('Please sign in')
          // router.push('/')
          showAlert({
            text: 'Please sign in first',
            callback: () => router.push('/'),
          })
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
            showAlert({
              text: 'Please create an order, cart is empty!',
              callback: () => router.push('/'),
            })
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
            // alert('Error! Please try again! Clearing cart...')
            showAlert({
              text: 'Some error tranisitoning to payments. Please try again! Clearing cart...',
              callback: () => clearCart(router),
            })
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
              // alert('Error! Order is wrong!! Clearing cart...')
              // clearCart(router)
              showAlert({
                text: 'Unable to arrange payment. Please try again! Clearing cart...',
                callback: () => clearCart(router),
              })
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
          // alert('Error! Please try again! Clearing cart...')
          // clearCart(router)
          showAlert({
            text: 'Some error creating Razorpay Order. Please try again! Clearing cart...',
            callback: () => clearCart(router),
          })
        }
      })
    }
  }, [isTransitionSuccess])

  async function RazorPayOP(query: any) {
    const { addPaymentToOrder } = await fetcher({ query })
    // alert(`Your payment status is: ${addPaymentToOrder.state}`)
    if (addPaymentToOrder.state == 'PaymentSettled') {
      // router.push('/')
      showAlert({
        text: `Your payment is successful!`,
        title: 'Success',
        callback: () => router.push('/'),
        icon: 'success',
      })
    } else {
      showAlert({
        text: `Your payment status is: ${addPaymentToOrder.state}. Clearing cart...`,
        callback: () => clearCart(router),
      })
    }
  }
  async function displayRazorpay() {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

    if (!res) {
      // alert('Razorpay SDK failed to load. Are you online?')
      showAlert({
        text: 'Razorpay SDK failed to load. Are you online?',
        // callback: () => clearCart(router),
      })
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

    const options = {
      key: 'rzp_test_4kRSTgXyUa5OIh',
      currency: data.currencyCode,
      amount: data.totalWithTax.toString(),
      order_id: data.customFields.razorpay_order_id,
      image: 'https://i.ibb.co/K2YxKjr/favicon-144x144.png',
      name: 'shop.io',
      description: 'Thank you for shopping with us. Please give us some money',
      theme: {
        color: '#000000',
      },
      send_sms_hash: 'true',
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
      <DisappearedLoading
        color="linear-gradient(to right, #12c2e9, #c471ed, #f64f59)"
        size="large"
      />
    </div>
  )
}

export default function Checkout() {
  return (
    <CommerceProvider>
      <CheckoutFlow />
    </CommerceProvider>
  )
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
          setOrderShippingMethod(shippingMethodId: "${shippingMethodId}") {
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
          generateRazorpayOrderId(orderId: "${orderId}") {
            __typename
          }
        }
      `
