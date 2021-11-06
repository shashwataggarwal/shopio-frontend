import React, { useEffect, useState } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from '../firebase/clientApp'
import { useAuthState } from 'react-firebase-hooks/auth'

export default function SignedIn() {
  const [user, loading, error] = useAuthState(firebase.auth())
  useEffect(() => {
    alert(`LOADING on SINGED IN${loading} user: ${user?.uid}`)

    if (!loading) {
      user?.getIdToken().then((idToken) => {
        // let token = idToken;
        console.log('authToken: ', idToken)
        if (typeof window !== 'undefined') {
          localStorage.setItem('phone_token', idToken)
          if (user.phoneNumber)
            localStorage.setItem('phone_number', user.phoneNumber)
        }
      })
    }
  }, [user, loading])
  return (
    <div>
      <h1>My App</h1>
      <p>Welcome {user?.phoneNumber}! You are now signed-in!</p>
      {/* <a onClick={() => firebase.auth().signOut()}>Sign-out</a> */}
    </div>
  )
}
