import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition',
        className
      )}
    />
  )
}
