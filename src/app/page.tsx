import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const posts = getSortedPostsData();
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className="about">
          <h2>About</h2>
          <p>
            I'm currently figuring out my next thing. Previously, I worked on Air and Ground Deterrence at Anduril. I also founded <Link href="/forge" className={styles.link}>Forge</Link>,  
            a language learning company, acquired (and later sold) a small SaaS business called <a href="https://x.com/cambaughn/status/1492226954631671809" target="_blank" rel="noopener noreferrer" className={styles.link}>Translate Channels</a>, and worked on local news as a software engineer at Sinclair Digital.
          </p>
          <p>You can connect with me on <a href="https://x.com/cambaughn" target="_blank" rel="noopener noreferrer" className={styles.link}>Twitter</a> and read more of my writing below.</p>
        </section>

        <section className="writing">
          <h2>Writing</h2>
          <div className="posts">
            {posts.map(({ id, date, title, description }) => (
              <article key={id} className="post-preview">
                <h2>
                  <Link href={`/posts/${id}`} className={styles.link}>{title}</Link>
                </h2>
                <time dateTime={new Date(date).toISOString()}>
                  {new Date(date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
                {description && <p>{description}</p>}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
