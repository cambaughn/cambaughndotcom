import styles from './page.module.css';

export default function Forge() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Forge</h1>
        <p>Your AI-powered language learning companion.</p>
        <div className={styles.links}>
          <a href="/forge/quizzes">Try the Language Quizzes →</a>
        </div>
      </main>
    </div>
  );
} 