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
        orders {
          items {
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
  return (
    <div className="flex flex-row justify-center items-center">
      <Image src={image} width={100} height={100} alt={name} />
      <Text>{name}</Text>
      <Text>{itemPrice}</Text>
      <Text>{quantity}</Text>
    </div>
  )
}

function PreviousOrder({ total, timeStamp, orderItems }) {
  return (
    <div style={{ borderBottom: '1px solid var(--secondary)', width: '100%' }}>
      {orderItems.map((item) => (
        <OrderItem {...item} key={item.name} />
      ))}
      <Text>Total:{total}</Text>
      {timeStamp && <Text>Order Placed At{timeStamp}</Text>}
    </div>
  )
}

export default function Orders(props) {
  console.log('order props', props)
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
            <PreviousOrder {...order} key={order.total} />
          ))
        )}
      </div>
    </Container>
  )
}

Orders.Layout = Layout
