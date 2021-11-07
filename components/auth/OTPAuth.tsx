import React, { useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from '../../firebase/clientApp'
import { useAuthState } from 'react-firebase-hooks/auth'

export default function OTPAuth({ handleLogin }: any) {
  const [user, loading, error] = useAuthState(firebase.auth())
  useEffect(() => {
    if (!loading) {
      if (user?.phoneNumber)
        user?.getIdToken().then((idToken) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('phone_token', idToken)
            localStorage.setItem('phone_number', user?.phoneNumber || '')
            handleLogin()
          }
        })
      else if (user?.email)
        user?.getIdToken().then((idToken) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', idToken)
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])
  const uiConfigOTP = {
    callbacks: {
      signInSuccessWithAuthResult: (authResult: any, redirectUrl: any) => {
        console.log('SUCCESS', authResult, redirectUrl)
        // localStorage.setItem('phone_token', authResult.credential.accessToken)
        // handleLogin()
      },
      signInFailure: (error: any) => alert(`ERROR ${error}`),
    },
    signInFlow: 'popup',
    signInOptions: [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        defaultCountry: 'IN',
      },
    ],
  }
  return (
    <StyledFirebaseAuth uiConfig={uiConfigOTP} firebaseAuth={firebase.auth()} />
  )
}
