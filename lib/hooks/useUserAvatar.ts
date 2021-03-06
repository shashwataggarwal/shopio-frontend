import { useEffect } from 'react'
import { useUI } from '@components/ui/context'
import { getRandomPairOfColors } from '@lib/colors'
import { useCustomer } from '@framework/customer'

export const useUserAvatar = (name = 'userAvatar') => {
  const { userAvatar, setUserAvatar } = useUI()
  const { data: customer } = useCustomer()
  useEffect(() => {
    if (customer === undefined) return
    if (!userAvatar && localStorage.getItem(name)) {
      // Get bg from localStorage and push it to the context.
      if (
        customer === null &&
        !localStorage.getItem(name)?.includes('linear-gradient')
      ) {
        const bg = getRandomPairOfColors()
        const value = `linear-gradient(140deg, ${bg[0]}, ${bg[1]} 100%)`
        localStorage.setItem(name, value)
        setUserAvatar(value)
      } else {
        setUserAvatar(localStorage.getItem(name))
      }
    } else if (customer && userAvatar) localStorage.setItem(name, userAvatar)

    if (!localStorage.getItem(name)) {
      // bg not set locally, generating one, setting localStorage and context to persist.
      const bg = getRandomPairOfColors()
      const value = `linear-gradient(140deg, ${bg[0]}, ${bg[1]} 100%)`
      localStorage.setItem(name, value)
      setUserAvatar(value)
    }

    // if (!customer) {
    //   // const avatar = localStorage.getItem('userAvatar')
    //   if (!userAvatar?.includes('linear-gradient')) {
    //     const bg = getRandomPairOfColors()
    //     const value = `linear-gradient(140deg, ${bg[0]}, ${bg[1]} 100%)`
    //     setUserAvatar(value)
    //   }
    // }
  }, [userAvatar, customer])

  return {
    userAvatar,
    setUserAvatar,
  }
}
