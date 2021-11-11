import React, { useEffect } from 'react'
import { DisappearedLoading } from 'react-loadingg'
import Swal from 'sweetalert2'

export default function Loading() {
  useEffect(() => {
    const t = setTimeout(() => {
      showAlert().then(({ isConfirmed }) => console.log(isConfirmed))
    }, 3000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="flex">
      <DisappearedLoading
        color="linear-gradient(to right, #12c2e9, #c471ed, #f64f59)"
        size="large"
      />{' '}
    </div>
  )
}

function showAlert({
  title = 'Error',
  text = 'There was an error',
  icon = 'error',
} = {}) {
  return Swal.fire({ title, text, icon })
}
