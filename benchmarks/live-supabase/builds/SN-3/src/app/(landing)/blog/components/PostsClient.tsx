"use client";

import type { Card } from '@once-ui-system/core';
import type { BlogPost } from '@/utils/utils';
import { Post } from './Post';

interface PostsClientProps extends React.ComponentProps<typeof Card> {
  posts: BlogPost[];
  range?: [number] | [number, number];
  thumbnail?: boolean;
  featured?: boolean;
}

export function PostsClient({
  posts,
  range,
  thumbnail = true,
  ...card
}: PostsClientProps) {
  const sortedBlogs = [...posts].sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedBlogs = range
    ? sortedBlogs.slice(
        range[0] - 1,
        range.length === 2 ? range[1] : sortedBlogs.length 
      )
    : sortedBlogs;

  return (
    <>
      {displayedBlogs.length > 0 && displayedBlogs.map((post) => (
        <Post
          key={post.slug}
          post={post}
          thumbnail={thumbnail}
          {...card}
        />
      ))}
    </>
  );
}
