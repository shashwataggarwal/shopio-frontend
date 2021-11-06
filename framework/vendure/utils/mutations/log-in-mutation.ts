export const loginMutation = /* GraphQL */ `mutation Authenticate(
  $auth_token: String!
  $phone_token: String!
  $phone_number: String!
) {
  authenticate(
    input: {
      firebaseBuyer: {
        auth_token: $auth_token
        phone_token: $phone_token
        phone_number: $phone_number
      }
    }
  ) {
    __typename
    ... on CurrentUser {
      id
      identifier
    }
    ... on ErrorResult {
      errorCode
      message
    }
  }
}
`
// export const loginMutation = /* GraphQL */ `
//   mutation login($username: String!, $password: String!) {
//     login(username: $username, password: $password) {
//       __typename
//       ... on CurrentUser {
//         id
//       }
//       ... on ErrorResult {
//         errorCode
//         message
//       }
//     }
//   }
// `
