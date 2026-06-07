'use client';
import styles from "./layout.module.css";
import { useState, useEffect } from "react";

export default () => {
  const [selectedPage, setSelectedPage] = useState("/");

    useEffect(() => {
      setSelectedPage(window.location.pathname);
    }, []);

  return (
    <nav className={styles.nav}>
      <a href="/" className={selectedPage === "/" ? styles.selected : ""}>rsm</a>
      <a href="/lbrry" className={selectedPage === "/lbrry" ? styles.selected : ""}>lbrry</a>
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