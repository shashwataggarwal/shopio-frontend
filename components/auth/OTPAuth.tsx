import React, { useEffect, useState, useRef } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from '../../firebase/clientApp'
import { useAuthState } from 'react-firebase-hooks/auth'
import dynamic from 'next/dynamic'
const Keyboard = dynamic(() => import('react-simple-keyboard'), { ssr: false })
// import Keyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import styles from './OTPAuth.module.css'

export default function OTPAuth({
  loginType,
  setAuthToken,
  setPhoneToken,
  setPhoneNumber,
  setOTPSuccess,
  setUserAvatar,
}: any) {
  const [user, loading, error] = useAuthState(firebase.auth())
  useEffect(() => {
    if (!loading) {
      if (user?.phoneNumber)
        user?.getIdToken().then((idToken) => {
          if (typeof window !== 'undefined') {
            // console.log('HELLOS', user)
            setPhoneToken(idToken)
            setPhoneNumber(user?.phoneNumber)
            // localStorage.setItem('phone_token', idToken)
            // localStorage.setItem('phone_number', user?.phoneNumber || '')
            // handleLogin()
          }
        })
      else if (user?.email)
        user?.getIdToken().then((idToken) => {
          if (typeof window !== 'undefined') {
            // console.log('USER', user)
            // localStorage.setItem('auth_token', idToken)
            setAuthToken(idToken)
            if (loginType != 'admin')
              // localStorage.setItem('userAvatar', user.photoURL || '')
              setUserAvatar(user.photoURL)
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])
  const uiConfigOTP = {
    callbacks: {
      signInSuccessWithAuthResult: (authResult: any, redirectUrl: any) => {
        // console.log('SUCCESS', authResult, redirectUrl)
        setOTPSuccess(true)
        // localStorage.setItem('phone_token', authResult.credential.accessToken)
        // handleLogin()
      },
      signInFailure: (error: any) => alert(`ERROR ${error}`),
      uiShown: () => {
        console.log('uiShown')
      },
    },
    signInFlow: 'popup',
    signInOptions: [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        defaultCountry: 'IN',
      },
    ],
  }

  const [showNumpad, setShowNumpad] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.getElementById('ui-sign-in-phone-confirmation-code-input')) {
        setShowNumpad(true)
      } else setShowNumpad(false)
    }, 2000)
    return () => clearInterval(timer)
  }, [])
  const [input, setInput] = useState('')

  const onKeyPress = (val: any) => {
    if (document.getElementsByClassName('firebaseui-textfield')) {
      document
        .getElementsByClassName('firebaseui-textfield')[0]
        .classList.add('is-focused')
    }
    let newVal = input
    if (val == 'del') {
      newVal = newVal.slice(0, -1)
    } else {
      newVal = newVal + val
    }
    setInput(newVal)

    // console.log(input)
    // inputField.current?.value = input
    if (document.getElementById('ui-sign-in-phone-confirmation-code-input'))
      document.getElementById(
        'ui-sign-in-phone-confirmation-code-input'
      ).value = newVal
  }

  return (
    <>
      <StyledFirebaseAuth
        uiConfig={uiConfigOTP}
        firebaseAuth={firebase.auth()}
      />
      {/* <Keyboard
        ref={keyboard}
        onChange={onChange}
        onKeyPress={onKeyPress}
        inputName="phone"
        layoutName={layout}
      /> */}
      {showNumpad && <MyKeyboard onKeyPress={onKeyPress} />}
    </>
  )
}

function MyKeyboard({ onKeyPress }: any) {
  return (
    <div className={styles.numpad}>
      {/* <span onClick={() => onKeyPress('7')}>7</span> */}
      <MyKey onKeyPress={onKeyPress} value="7" />
      <MyKey onKeyPress={onKeyPress} value="8" />
      <MyKey onKeyPress={onKeyPress} value="9" />
      <MyKey onKeyPress={onKeyPress} value="4" />
      <MyKey onKeyPress={onKeyPress} value="5" />
      <MyKey onKeyPress={onKeyPress} value="6" />
      <MyKey onKeyPress={onKeyPress} value="1" />
      <MyKey onKeyPress={onKeyPress} value="2" />
      <MyKey onKeyPress={onKeyPress} value="3" />
      <MyKey onKeyPress={onKeyPress} value="" />
      <MyKey onKeyPress={onKeyPress} value="0" />
      <MyKey onKeyPress={onKeyPress} value="del" />
    </div>
  )
}

function MyKey({ onKeyPress, value }: any) {
  return <span onClick={() => onKeyPress(value)}>{value}</span>
}
