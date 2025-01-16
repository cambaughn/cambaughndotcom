import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const posts = getSortedPostsData();
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
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
      </main>
    </div>
  );
}
