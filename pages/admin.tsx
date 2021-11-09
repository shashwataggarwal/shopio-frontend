import React, { useEffect, useState } from 'react'
import { Logo, Button, Input } from '@components/ui'
import { request, gql, GraphQLClient } from 'graphql-request'

import { LoginView } from '@components/auth'
import { CommerceProvider } from '@framework'

export default function Admin() {
  // const [loading, setLoading] = useState(false)
  // const [disabled, setDisabled] = useState(false)

  // const handleLogin = async (e) => {
  //   e.preventDefault()
  //   const auth_token = (await localStorage.getItem('auth_token')) || ''
  //   const phone_token = (await localStorage.getItem('phone_token')) || ''
  //   const phone_number = (await localStorage.getItem('phone_number')) || ''
  //   try {
  //     setLoading(true)
  //     const res = await admin_login({
  //       auth_token,
  //       phone_token,
  //       phone_number,
  //     })
  //     console.log('RES', res)

  //     if (res.authenticate.__typename == 'CurrentUser') {
  //       // successfully authenticated - redirect to Vendure Admin UI
  //       // window.location.href = `http://${process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN}/admin`
  //       window.location.replace(
  //         `http://${process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN}/admin`
  //       )
  //     }
  //     setLoading(false)
  //   } catch (error) {
  //     alert('ERROR!!')
  //     console.log(error)
  //     setLoading(false)
  //     setDisabled(false)
  //   }
  // }
  return (
    <CommerceProvider>
      <div
        className="flex flex-col"
        style={{
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="w-80 flex flex-col p-5" style={{ marginTop: '-2rem' }}>
          {/* <div className="flex justify-center pb-12 ">
            <Logo width="64px" height="64px" />
          </div>
          <div className="flex flex-col space-y-3">
            <Button
              variant="slim"
              type="submit"
              loading={loading}
              disabled={disabled}
            >
              Log In
            </Button>
          </div> */}
        </div>
        {/* <Button
        variant="slim"
        loading={loading}
        disabled={disabled}
        onClick={() => {
          admin_logout().then((res) => console.log(res, 'RES'))
        }}
      >
        Log Out
      </Button> */}
        <LoginView loginType="admin" />
      </div>
    </CommerceProvider>
  )
}

// function admin_login({ auth_token, phone_token, phone_number }) {
//   const endpoint = `http://${process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN}/admin-api`
//   const client = new GraphQLClient(endpoint, {
//     credentials: 'include',
//     mode: 'cors',
//   })
//   const query = gql`
//     mutation Authenticate(
//       $auth_token: String!
//       $phone_token: String!
//       $phone_number: String!
//     ) {
//       authenticate(
//         input: {
//           firebaseMerchant: {
//             auth_token: $auth_token
//             phone_token: $phone_token
//             phone_number: $phone_number
//           }
//         }
//       ) {
//         __typename
//         ... on CurrentUser {
//           id
//           identifier
//         }
//         ... on ErrorResult {
//           errorCode
//           message
//         }
//       }
//     }
//   `
//   //   const query = gql`
//   //     mutation {
//   //       authenticate(
//   //         input: {
//   //           firebaseSeller: {
//   //             auth_token: "$auth_token"
//   //             phone_token: "$phone_token"
//   //             phone_number: "$phone_number"
//   //           }
//   //         }
//   //       ) {
//   //         __typename
//   //         ... on CurrentUser {
//   //           id
//   //           identifier
//   //         }
//   //         ... on ErrorResult {
//   //           errorCode
//   //           message
//   //         }
//   //       }
//   //     }
//   //   `
//   const variables = {
//     auth_token,
//     phone_token,
//     phone_number,
//   }
//   return client.request(query, variables)
// }

// make gql request to end point
// const admin_login = gql`
//   mutation admin_login($auth_token: String!, $phone_token: String!, $phone_number: String!) {
//     admin_login(auth_token: $auth_token, phone_token: $phone_token, phone_number: $phone_number) {
//       auth_token
//       phone_token
//       phone_number
//     }
//   }
// `
// function admin_logout() {
//   const endpoint = `http://${process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN}/admin-api`
//   const query = gql`
//     mutation LogOut {
//       logout {
//         success
//         __typename
//       }
//     }
//   `
//   const variables = {}
//   return request(endpoint, query, variables)
// }
