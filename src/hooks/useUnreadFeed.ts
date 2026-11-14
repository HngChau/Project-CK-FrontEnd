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
    articleCount: number;
    matches: KeywordMatch[];
    unread: KeywordMatch[];
    unreadCount: number;
}

export function useUnreadFeed(): UseUnreadFeed {
    const { keywords } = useFollows();
    const { readIds } = useReadState();
    const hasKeywords = keywords.length > 0;

    const feeds = useAsync<Article[] | null>(
        () => (hasKeywords ? getAllFeeds() : Promise.resolve(null)),
        [hasKeywords]);

    const matches = useMemo<KeywordMatch[]>(
        () => (feeds.data ? filterByKeywords(feeds.data, keywords) : []),
        [feeds.data, keywords]);

    const unread = useMemo<KeywordMatch[]>(
        () => matches.filter((m) => !readIds.has(m.article.id)),
        [matches, readIds]);


    const loading = feeds.loading || (hasKeywords && feeds.data === null && feeds.error === null);
    return {
        loading,
        error: feeds.error,
        articleCount: feeds.data?.length ?? 0,
        matches,
        unread,
        unreadCount: unread.length,
    };
}