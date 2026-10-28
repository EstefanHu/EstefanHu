import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '../links'
import styles from './page.module.css'

const CARDS = [
  {
    label: 'Email',
    href: `mailto:${EMAIL}`,
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
    href: LINKEDIN_URL,
    value: 'For the public version of my work experience.',
  },
  {
    label: 'GitHub',
    href: GITHUB_URL,
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
            {/* mailto opens the mail client; profiles open in a new tab */}
            <a
              className={styles.link}
              href={card.href}
              {...(card.href.startsWith('mailto:')
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {card.label}
            </a>
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

            <span className={styles.cardValue}>{card.value}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default page
