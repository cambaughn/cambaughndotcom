import Link from 'next/link';
import styles from './page.module.css';

export default function Inkling() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Inkling</h1>
        <p>Your AI assistant that helps you get to the point of any YouTube video.</p>
      </main>
    </div>
  );
} 