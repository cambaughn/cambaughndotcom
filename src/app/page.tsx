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
            I'm currently working on Air and Ground Deterrence at Anduril. Previously, I founded{' '}
            <a href="https://youtu.be/D1EggOVIm_s" target="_blank" rel="noopener noreferrer">Forge</a>, 
            a language learning company and worked on local news as a software engineer at Sinclair Digital. 
            You can connect with me on{' '}
            <a href="https://x.com/cambaughn" target="_blank" rel="noopener noreferrer">Twitter</a> and 
            read more of my writing below.
          </p>
        </section>

        <section className="writing">
          <h2>Writing</h2>
          <div className="posts">
            {posts.map(({ id, date, title, description }) => (
              <article key={id} className="post-preview">
                <h2>
                  <Link href={`/posts/${id}`}>{title}</Link>
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
