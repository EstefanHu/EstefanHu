import styles from './page.module.css'
import Link from 'next/link'

const EMAIL = 'estefanhu074@gmail.com'

const CARDS = [
  {
    label: 'Email',
    href: `mailto:${EMAIL}`,
    internal: true,
    value: (
      <>
        {EMAIL}
        <br />
        best way to get in contact
      </>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/estefanhu/',
    value: 'For the public version of my work experience.',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/estefanhu/',
    value: 'If you would like to see some of my work.',
  },
]

function page() {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Say <span>Hello</span>
        </h1>
      </div>

      <ul className={styles.linkList}>
        {CARDS.map((card) => (
          <li key={card.label}>
            {card.internal ? (
              <Link className={styles.link} href={card.href}>
                {card.label}
              </Link>
            ) : (
              <a
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
                href={card.href}
              >
                {card.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.cards}>
        {CARDS.map((card, i) => (
          <div className={styles.card} key={card.label}>
            <div className={styles.cardHead}>
              <span className={styles.cardNumber}>
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className={styles.cardLabel}>{card.label}</span>
            </div>

            {card.value && (
              <span className={styles.cardValue}>{card.value}</span>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default page
