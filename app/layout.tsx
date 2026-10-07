import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

import Nav from "./nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <div className={styles.header}>
          <div className={styles.headerWrapper}>
            <Link className={styles.logo} href="/">E</Link>

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
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.linkedin.com/in/estefanhu/"
                >
                  L
                </a>

                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/estefanhu/"
                >
                  G
                </a>
              </span>
              <p>&copy; 2026 Justin Estefan Hu - all rights reserved</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
