import type { ReactNode } from "react";
import styles from "./StatusPage.module.css";

interface StatusPageProps {
  code: string;
  titre: string;
  message: string;
  children?: ReactNode;
}

export default function StatusPage({ code, titre, message, children }: StatusPageProps) {
  return (
    <section className={styles.page}>
      <p className={styles.code}>{code}</p>
      <h1 className={styles.title}>{titre}</h1>
      <p className={styles.message}>{message}</p>
      {children !== undefined && <div className={styles.actions}>{children}</div>}
    </section>
  );
}