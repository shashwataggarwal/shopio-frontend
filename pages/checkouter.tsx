import React from 'react'

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

export default function Checkout() {
  async function displayRazorpay() {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?')
      return
    }

    const data = await fetch('http://localhost:1337/razorpay', {
      method: 'POST',
    }).then((t) => t.json())

    console.log(data)

    const options = {
      key: process.env.RAZORPAY_KEY,
      currency: data.currency,
      amount: data.amount.toString(),
      order_id: data.id,
      name: 'Donation',
      description: 'Thank you for nothing. Please give us some money',
      handler: function (response: {
        razorpay_payment_id: any
        razorpay_order_id: any
        razorpay_signature: any
      }) {
        alert(response.razorpay_payment_id)
        alert(response.razorpay_order_id)
        alert(response.razorpay_signature)
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
