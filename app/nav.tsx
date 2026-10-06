'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={pathname === "/" ? styles.selected : ""}>rsm</Link>
      {/* startsWith so a project detail page keeps prjcts lit */}
      <Link href="/prjcts" className={pathname === "/prjcts" ? styles.selected : ""}>prjcts</Link>
      <Link href="/blg" className={pathname === "/blg" ? styles.selected : ""}>blg</Link>
      <Link href="/rdng" className={pathname === "/rdng" ? styles.selected : ""}>rdng</Link>
    </nav>
  );
}

export default Nav;
