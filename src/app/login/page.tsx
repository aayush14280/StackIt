// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }

      router.push('/ask')
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/ask')
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    }
  }

  return (
    <div className={styles.pageWrapper}> {/* Full-screen flex wrapper */}
      <main className={styles.mainContainer}>
        <h1 className={styles.heading}>
          {isRegistering ? 'Register' : 'Login'}
        </h1>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <input
            className={styles.inputField}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.inputField}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            {isRegistering ? 'Register' : 'Login'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className={styles.googleButton}
          >
            Sign in with Google
          </button>

          <p
            className={styles.toggleLink}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? 'Already have an account? Login'
              : 'New user? Register here'}
          </p>
        </form>
      </main>
    </div>
  )
}
