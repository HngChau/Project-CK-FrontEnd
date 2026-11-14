import { useMemo } from 'react';
import { useAsync } from './useAsync';
import { useFollows } from './useFollows';
import { useReadState } from './useReadState';
import { filterByKeywords, getAllFeeds } from '../services/rss';
import type { KeywordMatch } from '../services/rss';
import type { Article } from '../types';

interface UseUnreadFeed {
    loading: boolean;
    error: Error | null;
    articles: Article[] | null;  
    articleCount: number;
    matches: KeywordMatch[];
    unread: KeywordMatch[];
    unreadCount: number;
}

export function useUnreadFeed(live: Article[] | null = null): UseUnreadFeed {
    const { keywords } = useFollows();
    const { readIds } = useReadState();
    const hasKeywords = keywords.length > 0;

    const feeds = useAsync<Article[] | null>(
        () => (hasKeywords ? getAllFeeds() : Promise.resolve(null)),
        [hasKeywords]);

    const articles = hasKeywords ? (live ?? feeds.data) : null;

    const matches = useMemo<KeywordMatch[]>(
        () => (articles ? filterByKeywords(articles, keywords) : []),
        [articles, keywords]);

    const unread = useMemo<KeywordMatch[]>(
        () => matches.filter((m) => !readIds.has(m.article.id)),
        [matches, readIds]);

    const loading = feeds.loading || (hasKeywords && feeds.data === null && feeds.error === null);
    return {
        loading,
        error: feeds.error,
        articles,
        articleCount: articles?.length ?? 0,
        matches,
        unread,
        unreadCount: unread.length,
    };
}