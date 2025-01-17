import { getPostData, getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function Post({
  params,
}: {
  params: { id: string }
}) {
  try {
    const post = await getPostData(params.id);
    
    return (
      <article className="post">
        <header className="post-header">
          <h1>{post.title}</h1>
          <time dateTime={new Date(post.date).toISOString()}>
            {new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </time>
        </header>

        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        />
      </article>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    return (
      <div className="error-page">
        <h1>Post Not Found</h1>
        <p>The post you're looking for doesn't exist. <Link href="/">Return home</Link></p>
      </div>
    );
  }
} 