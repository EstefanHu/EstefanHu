'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

const SECTIONS = ["prjcts", "blg", "rdng"];

function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {SECTIONS.map((section) => (
        <Link
          key={section}
          href={`/${section}`}
          className={pathname === `/${section}` ? styles.selected : ""}
        >
          {section}
        </Link>
      ))}
    </nav>
  );
}

export default Nav;
