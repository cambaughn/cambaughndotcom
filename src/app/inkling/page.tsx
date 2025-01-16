import Link from 'next/link';
import styles from './page.module.css';

export default function Inkling() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Inkling</h1>
        <p>A better way to write.</p>
        
        <div className={styles.links}>
          <Link href="/inkling/legal">Terms & Conditions</Link>
        </div>
      </main>
    </div>
  );
} 