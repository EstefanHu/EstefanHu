'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

/**
 * The logo doubles as the way home, so it needs to know where you are: on the
 * landing page it takes the accent colour, the same one the nav uses for the
 * current section. A client component because usePathname needs the router.
 */
export default function Logo() {
  const pathname = usePathname();

  return (
    <Link
      className={`${styles.logo} ${pathname === "/" ? styles.logoSelected : ""}`}
      href="/"
      aria-label="Home"
    >
      E
    </Link>
  );
}