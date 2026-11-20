import { useMemo } from 'react';
import { useAsync } from './useAsync';
import { useFollowList } from './useFollowList';
import { useFollows } from './useFollows';
import { useReadState } from './useReadState';
import { CATEGORIES } from '../config/categories';
import { categoryLabel, filterByCategories, mergeMatches } from '../services/feedSources';
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
    hasFollows: boolean;
    sources: string[];
}

export function useUnreadFeed(live: Article[] | null = null): UseUnreadFeed {
    const { keywords } = useFollows();
    const [followedCats] = useFollowList('categories');
    const { readIds } = useReadState();

    const categories = useMemo(
        () => CATEGORIES.filter((c) => c.slug !== 'trang-chu' && followedCats.has(c.slug)),
        [followedCats]);
    const sources = useMemo(
        () => [...keywords, ...categories.map((c) => categoryLabel(c.name))],
        [keywords, categories]);
    const hasFollows = sources.length > 0;

    const feeds = useAsync<Article[] | null>(
        () => (hasFollows ? getAllFeeds() : Promise.resolve(null)),
        [hasFollows]);

    const articles = hasFollows ? (live ?? feeds.data) : null;

    const matches = useMemo<KeywordMatch[]>(
        () =>
            articles
                ? mergeMatches(filterByKeywords(articles, keywords), filterByCategories(articles, categories))
                : [],
        [articles, keywords, categories]);

    const unread = useMemo<KeywordMatch[]>(
        () => matches.filter((m) => !readIds.has(m.article.id)),
        [matches, readIds]);

    const loading = feeds.loading || (hasFollows && feeds.data === null && feeds.error === null);
    return {
        loading,
        error: feeds.error,
        articles,
        articleCount: articles?.length ?? 0,
        matches,
        unread,
        unreadCount: unread.length,
        hasFollows,
        sources,
    };
}