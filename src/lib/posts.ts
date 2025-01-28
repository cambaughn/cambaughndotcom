import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface Post {
  id: string;
  title: string;
  date: string;
  description?: string;
  contentHtml?: string;
}

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      title: matterResult.data.title,
      date: matterResult.data.date,
      description: matterResult.data.description,
    };
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) return 1;
    return -1;
  });
}

export async function getPostData(id: string): Promise<Post> {
  try {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Fix image links
    const contentWithFixedImages = matterResult.content.replace(
      /!\[\[(.*?)\]\]/g,
      '![](/attachments/$1)'
    );

    // Fix wiki-style links
    const contentWithFixedLinks = contentWithFixedImages.replace(
      /\[\[(.*?)\|(.*?)\]\]|\[\[(.*?)\]\]/g,
      (match, linkWithText, displayText, simpleLink) => {
        if (simpleLink) {
          // Handle simple case: [[page]]
          return `[${simpleLink}](/posts/${simpleLink})`;
        } else {
          // Handle case with display text: [[page|Display Text]]
          return `[${displayText}](/posts/${linkWithText})`;
        }
      }
    );

    const processedContent = await remark()
      .use(html)
      .process(contentWithFixedLinks);
    const contentHtml = processedContent.toString();

    return {
      id,
      title: matterResult.data.title,
      date: matterResult.data.date,
      description: matterResult.data.description,
      contentHtml,
    };
  } catch (error) {
    console.error(`Error loading post ${id}:`, error);
    throw error;
  }
} 