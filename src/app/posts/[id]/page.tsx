import { getPostData, getSortedPostsData } from '@/lib/posts';
import { Metadata } from 'next';
import { use } from 'react';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostData(id);
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

export default function Post({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const post = use(getPostData(id));
  
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
        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }} 
      />
    </article>
  );
} 