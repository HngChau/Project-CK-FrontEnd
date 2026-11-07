import { useState } from 'react';
import type { FormEvent } from 'react';
import { MAX_KEYWORDS, MAX_KEYWORD_LENGTH, keywordKey } from '../services/follows';
import type { AddResult } from '../services/follows';

interface Props {
    keywords: string[];
    onAdd: (keyword: string) => AddResult;
    onRemove: (keyword: string) => void;
    validate: (keyword: string) => string;     /** Trả về thông báo lỗi cho từ khóa đang gõ, chuỗi rỗng nếu hợp lệ*/
}

// Gợi ý nhanh cho người mới, ẩn đi những từ khóa đã theo dõi
const SUGGESTIONS = ['giáo dục', 'bóng đá', 'công nghệ', 'giá vàng', 'thời tiết'];

export default function KeywordManager({ keywords, onAdd, onRemove, validate }: Props) {
    const [input, setInput] = useState('');
    const [submitError, setSubmitError] = useState('');

    // Báo lỗi ngay khi đang gõ (không báo khi ô còn trống)
    const liveError = input.trim() ? validate(input) : '';
    const error = liveError || submitError;

    const followed = new Set(keywords.map(keywordKey));
    const suggestions = SUGGESTIONS.filter((s) => !followed.has(keywordKey(s)));

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = onAdd(input);
        if (result.ok) {
            setInput('');
            setSubmitError('');
        } else {
            setSubmitError(result.error);
        }
    };

    const addSuggestion = (keyword: string) => {
        const result = onAdd(keyword);
        setSubmitError(result.ok ? '' : result.error);
    };

    return (
        <section className="kw-box" aria-label="Quản lý từ khóa theo dõi">
            <form className="kw-form" onSubmit={submit} noValidate>
                <input
                    type="text"
                    value={input}
                    maxLength={MAX_KEYWORD_LENGTH}
                    placeholder="Nhập từ khóa muốn theo dõi, ví dụ: giá vàng"
                    aria-label="Từ khóa theo dõi"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'kw-error' : undefined}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setSubmitError('');
                    }}
                />
                <button type="submit" disabled={!input.trim() || Boolean(liveError)}>
                    Theo dõi
                </button>
            </form>

            {error && (
                <p id="kw-error" className="kw-error" role="alert">
                    {error}
                </p>
            )}

            <div className="kw-meta">
                <span>Từ khóa đang theo dõi</span>
                <span>
          {keywords.length}/{MAX_KEYWORDS}
        </span>
            </div>

            {keywords.length > 0 ? (
                <ul className="kw-chips" aria-label="Từ khóa đang theo dõi">
                    {keywords.map((k) => (
                        <li key={k}>
                            <span>{k}</span>
                            <button type="button" onClick={() => onRemove(k)} aria-label={`Bỏ theo dõi ${k}`}>
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="kw-none">Chưa có từ khóa nào.</p>
            )}

            {suggestions.length > 0 && keywords.length < MAX_KEYWORDS && (
                <div className="kw-suggest">
                    <span>Gợi ý:</span>
                    {suggestions.map((s) => (
                        <button key={s} type="button" onClick={() => addSuggestion(s)}>
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}