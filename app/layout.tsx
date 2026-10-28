import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

import Nav from "./nav";
import Logo from "./logo";
import { GithubIcon, GoodreadsIcon, LinkedinIcon } from "./social-icons";
import { GITHUB_URL, GOODREADS_URL, LINKEDIN_URL } from "./links";

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: LINKEDIN_URL, Icon: LinkedinIcon },
  { label: "GitHub", href: GITHUB_URL, Icon: GithubIcon },
  { label: "Goodreads", href: GOODREADS_URL, Icon: GoodreadsIcon },
];

export const metadata: Metadata = {
  title: {
    default: "Estefan Hu - Software Developer",
    template: "%s | Estefan Hu",
  },
  description: "My Resume Website",
  metadataBase: new URL("https://estefanhu.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className={styles.header}>
          <div className={styles.headerWrapper}>
            <Logo />

            <Nav />
          </div>
        </div>

        <main className={styles.main}>
          {children}
        </main>

        <div className={styles.footer}>
          <div className={styles.footerWrapper}>
            <div className={styles.footerTop}>
              <div className={styles.branding}>
                <Link href="/">
                  <p className={styles.name}>j. estefan hu</p>
                </Link>
                <p>Software Developer</p>
                <p>Seattle, Washington</p>
              </div>

              <div className={styles.footerNav}>
                <span>
                  <h4>links</h4>
                  <Link href="/blg">blog</Link>
                  <Link href="/rdng">reading</Link>
                  <Link href="/prjcts">projects</Link>
                </span>

                <span>
                  <h4>me</h4>
                  <Link href="/">resume</Link>
                  <Link href="/cntct">contact</Link>
                  <Link href="/lgn">login</Link>
                </span>
              </div>
            </div>

            <div className={styles.legal}>
              <span>
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    href={href}
                  >
                    <Icon />
                  </a>
                ))}
              </span>
              <p>&copy; 2026 Justin Estefan Hu - all rights reserved</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
