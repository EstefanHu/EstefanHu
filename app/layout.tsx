import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estefan Hu - Software Developer",
  description: "Portfolio website for Justin Estefan Hu, a software developer based in Seattle, Washington. Showcasing projects, experience, and contact information.",
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
            <a className={styles.logo} href="/">E</a>

            <nav className={styles.nav}>
              <a href="/" className={styles.selected}>rsm</a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.linkedin.com/in/estefanhu/"
                >lnkdn</a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.github.com/estefanhu/"
                >gthb</a>
            </nav>
          </div>
        </div>

        <main className={styles.main}>
          {children}
        </main>
        
        <div className={styles.footer}>
          <div className={styles.footerWrapper}>
            <div className={styles.footerTop}>
              <div className={styles.branding}>
                <a href="/">
                  <p className={styles.name}>j. estefan hu</p>
                </a>
                <p>Software Developer</p>
                <p>Seattle, Washington</p>
              </div>

              <div className={styles.footerNav}>
                <span>
                  <h4>me</h4>
                  <a href="/">resume</a>
                  <a href="/cntct">contact</a>
                  <a href="/lgn">login</a>
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
              <p>&copy; 2024 Justin Estefan Hu - all rights reserved</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
