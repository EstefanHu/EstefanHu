'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

function Page() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email || !password) {
      setError('both fields are required')
      return
    }

    // no auth backend wired up yet &mdash; redirect for now
    router.push('/')
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Member <span>Login</span></h1>
      </div>

      <section className={styles.section}>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit">
            Login
          </button>
        </form>

        <p className={styles.footnote}>
          This area is private and used for drafts &mdash; nothing here is public.
        </p>
      </section>
    </>
  )
}

export default Page