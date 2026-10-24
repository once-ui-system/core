import { getPosts } from '@/utils/utils';
import { Post } from './Post';
import type { Card } from '@once-ui-system/core';

interface PostsProps extends React.ComponentProps<typeof Card> {
    range?: [number] | [number, number];
    thumbnail?: boolean;
    featured?: boolean;
}

export async function Posts({
    range,
    thumbnail = true,
    ...card
}: PostsProps) {
    const allBlogs = await getPosts(["src", "content", "blog"]);

    const sortedBlogs = allBlogs.sort((a, b) => {
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