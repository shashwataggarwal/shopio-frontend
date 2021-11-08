import React from 'react'
import { DisappearedLoading } from 'react-loadingg'

export default function Loading() {
  return (
    <div className="flex">
      <DisappearedLoading
        color="linear-gradient(to right, #12c2e9, #c471ed, #f64f59)"
        size="large"
      />{' '}
    </div>
  )
}
