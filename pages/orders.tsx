import type { GetStaticPropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Bag } from '@components/icons'
import { Layout } from '@components/common'
import { Container, Text } from '@components/ui'
import useCustomer from '@framework/customer/use-customer'
import { useEffect, useState } from 'react'
import { fetcher } from '@framework/fetcher'
import Image from 'next/image'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise
  return {
    props: { pages, categories },
  }
}

function getCustomerOrders() {
  const query = `
    query {
      activeCustomer {
        orders(options: {sort:{orderPlacedAt:DESC}}) {
          items {
            id
            state
            lines {
              productVariant {
                name
                product {
                  assets {
                    preview
                    name
                  }
                }
              }
              quantity
              linePriceWithTax
            }
            orderPlacedAt
            totalWithTax
          }
        }
      }
    }
  `
  return fetcher({ query })
}

function OrderItem({ itemPrice, quantity, name, image }) {
  const itemPriceFormatted = `₹ ${(parseInt(itemPrice) / 100).toFixed(2)}`
  return (
    <div
      className="flex flex-row items-center"
      style={{ marginBottom: '10px' }}
    >
      <Image src={image} width={100} height={100} alt={name} />
      <div
        className="flex flex-row justify-content-between"
        style={{ width: '100%' }}
      >
        <Text variant="sectionHeading" style={{ width: '80%' }}>
          {name}
        </Text>
        <Text style={{ width: '5%' }}>{quantity}</Text>
        <Text style={{ marginRight: 0, width: '15%', textAlign: 'right' }}>
          {itemPriceFormatted}
        </Text>
      </div>
    </div>
  )
}

function PreviousOrder({ total, timeStamp, orderItems, id, status }) {
  const totalFormatted = `₹ ${(parseInt(total) / 100).toFixed(2)}`
  const dateObj = new Date(timeStamp)
  // const dateFormatted =
  //   dateObj.toDateString() + ' ' + dateObj.toLocaleTimeString()
  const dateFormatted = dateObj.toLocaleString()
  const statusFormatted = status.replace(/([A-Z])/g, ' $1').trim()
  return timeStamp != null || undefined ? (
    <div
      style={{
        width: '100%',
        background: 'var(--accent-2)',
        margin: '20px',
        padding: '20px',
      }}
    >
      <div
        className="flex flex-row justify-content-between"
        style={{
          background: 'var(--secondary)',
          margin: '-20px',
          marginBottom: '20px',
          padding: '10px 20px',
        }}
      >
        <div>
          <Text
            style={{ margin: 0, color: 'var(--primary)', padding: 0 }}
            variant="sectionHeading"
          >
            {statusFormatted}
          </Text>
          <Text style={{ margin: 0, color: 'var(--primary)' }}>#{id}</Text>
        </div>
        <Text
          style={{
            marginRight: 0,
            color: 'var(--primary)',
            alignSelf: 'center',
            fontWeight: 'bold',
          }}
        >
          📅 {dateFormatted}
        </Text>
      </div>
      {orderItems.map((item, index) => (
        <OrderItem {...item} key={`${item.name}.${index}.${timeStamp}`} />
      ))}
      <div className="flex flex-row justify-content-between">
        {/* <Text style={{ margin: 0 }}>Status: {statusFormatted}</Text> */}
        <Text
          style={{
            marginRight: '-20px',
            marginBottom: '-20px',
            padding: '10px',
            background: 'var(--secondary)',
            color: 'var(--primary)',
            whiteSpace: 'pre-line',
            textAlign: 'right',
            width: '15%',
            fontWeight: 'bold',
          }}
        >
          💰Total{'\n'}
          <span style={{ fontSize: 'x-large' }}>{totalFormatted}</span>
        </Text>
      </div>
    </div>
  ) : null
}

export default function Orders(props) {
  const { data: customer } = useCustomer()
  const [customerOrders, setCustomerOrders] = useState()
  useEffect(() => {
    if (customer) {
      getCustomerOrders()
        .then(
          ({
            activeCustomer: {
              orders: { items },
            },
          }) => setCustomerOrders(items)
        )
        .catch((e) => console.error(e))
    }
  }, [customer])
  useEffect(() => {
    if (customerOrders) {
      customerOrders.map((order) => {
        const total = order.totalWithTax
        const timeStamp = order.orderPlacedAt
        const orderItems = order.lines.map((item) => {
          const itemPrice = item.linePriceWithTax
          const quantity = item.quantity
          const name = item.productVariant.name
          const image = item.productVariant?.product?.assets[0]?.preview
          return { itemPrice, quantity, name, image }
        })
        return { total, timeStamp, orderItems }
      })
    }
  }, [customerOrders])
  const orders = () => {
    if (customerOrders) {
      return customerOrders.map((order) => {
        const total = order.totalWithTax
        const id = order.id
        const status = order.state
        const timeStamp = order.orderPlacedAt
        const orderItems = order.lines.map((item) => {
          const itemPrice = item.linePriceWithTax
          const quantity = item.quantity
          const name = item.productVariant.name
          const image = item.productVariant?.product?.assets[0]?.preview
          return { itemPrice, quantity, name, image }
        })
        return { total, timeStamp, orderItems, id, status }
      })
    }
  }
  return (
    <Container>
      <Text variant="pageHeading">My Orders</Text>
      <div className="flex-1 p-24 flex flex-col justify-center items-center ">
        {!customerOrders ? (
          <>
            <span className="border border-dashed border-secondary rounded-full flex items-center justify-center w-16 h-16 p-12 bg-primary text-primary">
              <Bag className="absolute" />
            </span>
            <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
              No orders found
            </h2>
            <p className="text-accent-6 px-10 text-center pt-2">
              Biscuit oat cake wafer icing ice cream tiramisu pudding cupcake.
            </p>
          </>
        ) : (
          orders()?.map((order) => (
            <PreviousOrder {...order} key={`${order.id}`} />
          ))
        )}
      </div>
    </Container>
  )
}

Orders.Layout = Layout
