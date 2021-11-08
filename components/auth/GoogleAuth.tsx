import React from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from '../../firebase/clientApp'

export default function GoogleAuth({
  setAuthMode,
  loginType,
  setGoogleSuccess,
}: any) {
  const uiConfigGoogle = {
    callbacks: {
      signInSuccessWithAuthResult: (authResult: any, redirectUrl: any) => {
        // console.log('SUCCESS', authResult, redirectUrl)
        // localStorage.setItem('auth_token', authResult.credential.accessToken)
        setGoogleSuccess(true)
        // setAuthMode('otp')
      },
      signInFailure: (error: any) => alert(`ERROR ${error}`),
    },
    signInFlow: 'popup',
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  }
  return (
    <StyledFirebaseAuth
      uiConfig={uiConfigGoogle}
      firebaseAuth={firebase.auth()}
    />
  )
}
