import { FC, useRef, useEffect } from 'react'
import { useUserAvatar } from '@lib/hooks/useUserAvatar'
import Image from 'next/image'
interface Props {
  className?: string
  children?: any
}

const Avatar: FC<Props> = ({}) => {
  let ref = useRef() as React.MutableRefObject<HTMLInputElement>
  let { userAvatar } = useUserAvatar()
  const isAvatarImage = userAvatar.includes('googleusercontent')
  return (
    <div
      ref={ref}
      style={{ backgroundImage: isAvatarImage ? '' : userAvatar }}
      // style={{
      //   backgroundImage: `url(${userAvatar})`,
      //   backgroundPosition: 'center',
      //   backgroundSize: 'contain',
      // }}
      className="inline-block h-8 w-8 rounded-full border-2 border-primary hover:border-secondary focus:border-secondary transition-colors ease-linear"
    >
      {/* Add an image - We're generating a gradient as placeholder  <img></img> */}
      {/* <img src={userAvatar} alt='avatar'/> */}
      {userAvatar && isAvatarImage && (
        <Image
          src={userAvatar}
          alt="avatar"
          width="100%"
          height="100%"
          objectFit="contain"
          className="rounded-full"
        />
      )}
    </div>
  )
}

export default Avatar
