import styles from './page.module.css'
import Link from 'next/link'

const EMAIL = 'estefan.hu.dev@gmail.com'

const LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/estefanhu/',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/estefanhu/',
  },
  {
    label: 'Resume',
    href: '/',
    internal: true,
  },
]

function page() {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Get in <span>Touch</span></h1>
        <p>
          The fastest way to reach me is email. I read everything and reply to
          most things within a few days.
        </p>
      </div>

      <section className={styles.section}>
        <h3>Email</h3>

        <a className={styles.email} href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </section>

      <section className={styles.section}>
        <h3>Elsewhere</h3>

        <ul className={styles.linkList}>
          {LINKS.map((link) => (
            <li key={link.label}>
              {link.internal ? (
                <Link href={link.href}>{link.label}</Link>
              ) : (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={link.href}
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>Based In</h3>

        <p className={styles.text}>Seattle, Washington</p>
        <p className={styles.text}>
          Remote friendly &mdash; collaborating with teams across Pacific Time,
          Eastern Time, and Central European Time.
        </p>
      </section>
    </>
  )
}

export default page