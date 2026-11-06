import { useCallback, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../services/storage';

export interface ArticleComment {
    id: string;
    userId: string;
    author: string;
    content: string;
    createdAt: number;
    /** Tiêu đề và đường dẫn bài viết, để trang cá nhân hiển thị được hoạt động bình luận. */
    articleTitle?: string;
    articlePath?: string;
}

/** Bình luận kèm id bài viết, dùng cho trang hoạt động bình luận. */
export interface UserComment extends ArticleComment {
    articleId: string;
}

export interface ArticleMeta {
    title: string;
    path: string;
}

const KEY_PREFIX = 'dt_comments:';
const storageKey = (articleId: string): string => KEY_PREFIX + articleId;

/** Gom mọi bình luận của một người dùng từ tất cả bài viết, mới nhất trước. */
export function getUserComments(userId: string): UserComment[] {
    const result: UserComment[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(KEY_PREFIX)) continue;
        const articleId = key.slice(KEY_PREFIX.length);
        for (const c of readJSON<ArticleComment[]>(key, [])) {
            if (c.userId === userId) result.push({ ...c, articleId });
        }
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteComment(articleId: string, commentId: string): void {
    const updated = readJSON<ArticleComment[]>(storageKey(articleId), []).filter((c) => c.id !== commentId);
    writeJSON<ArticleComment[]>(storageKey(articleId), updated);
}

interface UseComments {
    comments: ArticleComment[];
    add: (userId: string, author: string, content: string, article: ArticleMeta) => void;
    remove: (commentId: string) => void;
}

export function useComments(articleId: string): UseComments {
    const [comments, setComments] = useState<ArticleComment[]>([]);

    useEffect(() => {
        setComments(readJSON<ArticleComment[]>(storageKey(articleId), []));
    }, [articleId]);

    const add = useCallback(
        (userId: string, author: string, content: string, article: ArticleMeta): void => {
            const text = content.trim();
            if (!text) return;
            const comment: ArticleComment = {
                id: crypto.randomUUID(),
                userId,
                author,
                content: text,
                createdAt: Date.now(),
                articleTitle: article.title,
                articlePath: article.path,
            };
            const updated = [comment, ...readJSON<ArticleComment[]>(storageKey(articleId), [])];
            writeJSON<ArticleComment[]>(storageKey(articleId), updated);
            setComments(updated);
        },
        [articleId]
    );

    const remove = useCallback(
        (commentId: string): void => {
            deleteComment(articleId, commentId);
            setComments(readJSON<ArticleComment[]>(storageKey(articleId), []));
        },
        [articleId]
    );

    return { comments, add, remove };
}