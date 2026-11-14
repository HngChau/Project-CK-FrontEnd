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
    matches: KeywordMatch[];
    unread: KeywordMatch[];
    unreadCount: number;
}

export function useUnreadFeed(): UseUnreadFeed {
    const { keywords } = useFollows();
    const { readIds } = useReadState();
    const hasKeywords = keywords.length > 0;

    const feeds = useAsync<Article[]>(
        () => (hasKeywords ? getAllFeeds() : Promise.resolve([] as Article[])),
        [hasKeywords]);

    const matches = useMemo<KeywordMatch[]>(
        () => (feeds.data ? filterByKeywords(feeds.data, keywords) : []),
        [feeds.data, keywords]);

    const unread = useMemo<KeywordMatch[]>(
        () => matches.filter((m) => !readIds.has(m.article.id)),
        [matches, readIds]);

    return { loading: feeds.loading, error: feeds.error, matches, unread, unreadCount: unread.length };
}