import React, { useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from '../firebase/clientApp'
import { useAuthState } from 'react-firebase-hooks/auth'

// Configure FirebaseUI.
const uiConfig = {
  // Redirect to / after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/signedIn',
  // GitHub as the only included Auth Provider.
  // You could add and configure more here!
  signInOptions: [
    {
      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      defaultCountry: 'IN',
    },
  ],
}

function SignInScreen() {
  const [user, loading, error] = useAuthState(firebase.auth())
  const [isTokenSet, setIsTokenSet] = React.useState(false)
  useEffect(() => {
    alert(`LOADING on OTP ${loading} user: ${user?.uid}`)
    if (!loading && !isTokenSet) {
      user?.getIdToken().then((idToken) => {
        // let token = idToken;
        console.log('authToken: ', idToken)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', idToken)
          setIsTokenSet(true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])
  // console.log('STATE', user, loading)
  // user?.getIdToken().then((idToken) => {
  //   // let token = idToken;
  //   console.log('authToken: ', idToken)
  // })
  return (
    <div>
      <h1>Pineapple Login</h1>
      <p>Please sign-in:</p>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  )
}

export default SignInScreen
