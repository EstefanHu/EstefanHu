'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={pathname === "/" ? styles.selected : ""}>rsm</Link>
      <Link href="/rdng" className={pathname === "/rdng" ? styles.selected : ""}>rdng</Link>
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
  );
}

export default Nav;