import { getPostData, getSortedPostsData } from '@/lib/posts';
import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const post = await getPostData(params.id);
  return {
    title: post.title,
    description: post.description,
  };
}

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
} 