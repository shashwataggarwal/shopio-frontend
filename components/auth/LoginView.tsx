import { FC, useEffect, useState, useCallback } from 'react'
import { Logo, Button, Input } from '@components/ui'
import { fetcher } from '@framework/fetcher'
import useLogin from '@framework/auth/use-login'
import { useUI } from '@components/ui/context'
import { validate } from 'email-validator'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from '../../firebase/clientApp'
import OTPAuth from './OTPAuth'
import GoogleAuth from './GoogleAuth'
import { gql, GraphQLClient } from 'graphql-request'
import { useUserAvatar } from '@lib/hooks/useUserAvatar'
import Swal from 'sweetalert2'

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

interface Props {}

function adminLogin({ auth_token, phone_token, phone_number }: any) {
  const endpoint = `https://${process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN}/admin-api`
  const client = new GraphQLClient(endpoint, {
    credentials: 'include',
    mode: 'cors',
  })
  const query = gql`
    mutation Authenticate(
      $auth_token: String!
      $phone_token: String!
      $phone_number: String!
    ) {
      authenticate(
        input: {
          firebaseMerchant: {
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
  const variables = {
    auth_token,
    phone_token,
    phone_number,
  }
  return client.request(query, variables)
}

const LoginView: FC<Props> = (props) => {
  // Form State
  const [auth_token, setAuthToken] = useState()
  const [phone_token, setPhoneToken] = useState()
  const [phone_number, setPhoneNumber] = useState()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [googleSuccess, setGoogleSuccess] = useState(false)
  const [otpSuccess, setOTPSuccess] = useState(false)
  const [userAvatar, setUserAvatar] = useState()
  const { setModalView, closeModal } = useUI()

  const { setUserAvatar: setUserAvatarHook } = useUserAvatar()

  const { loginType } = props

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const login = loginType == 'admin' ? adminLogin : useLogin()

  useEffect(() => {
    if (googleSuccess && otpSuccess) {
      if (auth_token && phone_token && phone_number) {
        handleLogin()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth_token, phone_token, phone_number, googleSuccess, otpSuccess])

  const handleLogin = async () => {
    // const auth_token = (await localStorage.getItem('auth_token')) || ''
    // const phone_token = (await localStorage.getItem('phone_token')) || ''
    // const phone_number = (await localStorage.getItem('phone_number')) || ''
    try {
      setLoading(true)
      setMessage('')
      if (!auth_token || !phone_token || !phone_number) {
        throw new Error('Missing credentials')
      }

      const res = await login({
        auth_token,
        phone_token,
        phone_number,
      })
      // console.log('RES', res)
      if (loginType == 'admin') {
        const isAdminSuccess = res.authenticate.__typename == 'CurrentUser'
        isAdminSuccess
          ? window.location.replace(
              `https://${process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN}/admin`
            )
          : setMessage(
              res.authenticate.message + '. Please reload and try again.'
            )
      }
      if (
        loginType == 'admin' &&
        res.authenticate.__typename == 'CurrentUser'
      ) {
        // successfully authenticated - redirect to Vendure Admin UI
        window.location.replace(
          `https://${process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN}/admin`
        )
        // window.location.replace(`https://google.com/`)
      }
      // console.log('user avatar', userAvatar)
      if (res == null && userAvatar) setUserAvatarHook(userAvatar)
      setLoading(false)
      closeModal()
    } catch (error) {
      showAlert({ text: 'Could not login!! Please try again...' })
      setLoading(false)
      setDisabled(false)
    }
  }

  // const handleLogin = async (e: React.SyntheticEvent<EventTarget>) => {
  //   e.preventDefault()

  //   const auth_token = (await localStorage.getItem('auth_token')) || ''
  //   const phone_token = (await localStorage.getItem('phone_token')) || ''
  //   const phone_number = (await localStorage.getItem('phone_number')) || ''
  //   try {
  //     setLoading(true)
  //     setMessage('')
  //     const res = await login({
  //       auth_token,
  //       phone_token,
  //       phone_number,
  //     })
  //     console.log('RES', res)
  //     setLoading(false)
  //     closeModal()
  //   } catch (error) {
  //     alert('ERROR!!')
  //     console.log(error)
  //     // setMessage(errors[0].message)
  //     setLoading(false)
  //     setDisabled(false)
  //   }
  // }

  return (
    <form
      onSubmit={() => {}}
      className="w-80 flex flex-col justify-between p-3"
    >
      <div className="flex justify-center pb-12 ">
        {loginType == 'admin' ? (
          <Logo adminLogo />
        ) : (
          <Logo width="64px" height="64px" />
        )}
      </div>
      <div className="flex flex-col space-y-3">
        {message && (
          <div className="text-red border border-red p-3">{message}</div>
        )}
        {!googleSuccess ? (
          <GoogleAuth
            loginType={loginType}
            setGoogleSuccess={setGoogleSuccess}
          />
        ) : (
          <OTPAuth
            setOTPSuccess={setOTPSuccess}
            loginType={loginType}
            setAuthToken={setAuthToken}
            setPhoneToken={setPhoneToken}
            setPhoneNumber={setPhoneNumber}
            setUserAvatar={setUserAvatar}
          />
        )}
      </div>
    </form>
  )
}

export default LoginView
