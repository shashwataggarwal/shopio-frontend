import { FC, useEffect, useState, useCallback } from 'react'
import { Logo, Button, Input } from '@components/ui'
import useLogin from '@framework/auth/use-login'
import { useUI } from '@components/ui/context'
import { validate } from 'email-validator'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from '../../firebase/clientApp'
import OTPAuth from './OTPAuth'
import GoogleAuth from './GoogleAuth'

interface Props {}

const LoginView: FC<Props> = () => {
  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('google')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const { setModalView, closeModal } = useUI()

  const login = useLogin()

  const handleLogin = async () => {
    const auth_token = (await localStorage.getItem('auth_token')) || ''
    const phone_token = (await localStorage.getItem('phone_token')) || ''
    const phone_number = (await localStorage.getItem('phone_number')) || ''
    try {
      setLoading(true)
      setMessage('')
      const res = await login({
        auth_token,
        phone_token,
        phone_number,
      })
      console.log('RES', res)
      setLoading(false)
      closeModal()
    } catch (error) {
      alert('ERROR!!')
      console.log(error)
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
      onSubmit={() => console.log('yo')}
      className="w-80 flex flex-col justify-between p-3"
    >
      <div className="flex justify-center pb-12 ">
        <Logo width="64px" height="64px" />
      </div>
      <div className="flex flex-col space-y-3">
        {message && (
          <div className="text-red border border-red p-3">{message}</div>
        )}
        {authMode == 'google' ? (
          <GoogleAuth setAuthMode={setAuthMode} />
        ) : (
          <OTPAuth handleLogin={handleLogin} />
        )}
      </div>
    </form>
  )
}

export default LoginView
