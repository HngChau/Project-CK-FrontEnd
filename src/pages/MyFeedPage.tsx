import { useState } from 'react';
import type { FormEvent } from 'react';
import { useFollows } from '../hooks/useFollows';
import { getAllFeeds, removeAccents } from '../services/rss';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';
import type { Article } from '../types';

// CHỨC NĂNG MỚI 2 (TV3)
export default function MyFeedPage() {
  const { keywords, add, remove } = useFollows();
  const [input, setInput] = useState('');

  const state = useAsync<Article[]>(async () => {
    if (!keywords.length) return [];
    const all = await getAllFeeds();
    const keys = keywords.map(removeAccents);
    return all.filter((a) => {
      const text = removeAccents(a.title + ' ' + a.summary);
      return keys.some((k) => text.includes(k));
    });
  }, [keywords.join('|')]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    add(input);
    setInput('');
  };

  return (
    <>
      <h1>Bản tin của tôi</h1>
      <form onSubmit={submit} className="search">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Theo dõi từ khóa, ví dụ: giá vàng" aria-label="Từ khóa" />
        <button type="submit">Theo dõi</button>
      </form>
      <ul className="chips">
        {keywords.map((k) => (
          <li key={k}>
            {k} <button className="link" onClick={() => remove(k)} aria-label={`Bỏ theo dõi ${k}`}>x</button>
          </li>
        ))}
      </ul>
      {/* TODO (TV3): badge số tin mới chưa đọc trên menu, đánh dấu đã đọc, tự làm mới mỗi 5 phút,
          nhóm kết quả theo từ khóa, trang thống kê từ khóa/chuyên mục đọc nhiều */}
      <ArticleList state={state} empty={keywords.length ? 'Chưa có tin khớp từ khóa.' : 'Thêm từ khóa để bắt đầu theo dõi.'} />
    </>
  );
}
