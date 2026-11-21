import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    BackupError,
    MAX_FILE_SIZE,
    applyBackup,
    buildBackup,
    downloadBackup,
    parseBackup,
} from '../services/dataBackup';
import type { BackupSection, ParsedBackup } from '../services/dataBackup';
import '../pages/auth.css';

const LABELS: Record<BackupSection, string> = {
    bookmarks: 'bài đã lưu',
    collections: 'bộ sưu tập',
    assignments: 'bài đã xếp vào bộ sưu tập',
    notes: 'ghi chú',
    keywords: 'từ khóa theo dõi',
    followedCategories: 'chuyên mục theo dõi',
    followedAuthors: 'tác giả theo dõi',
};

function summarize(counts: ParsedBackup['counts']): string {
    return (Object.keys(counts) as BackupSection[])
        .map((s) => `${counts[s]} ${LABELS[s]}`)
        .join(', ');
}

interface Message {
    type: 'success' | 'error';
    text: string;
}

// Khối "Dữ liệu của bạn": sao lưu ra file JSON và khôi phục từ file
export default function DataBackup() {
    const { user } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<Message | null>(null);
    const [busy, setBusy] = useState(false);

    if (!user) return null;

    const exportData = () => {
        const file = buildBackup(user.id);
        downloadBackup(file);
        setMessage({
            type: 'success',
            text: `Đã xuất dữ liệu: ${summarize({
                bookmarks: file.bookmarks.length,
                collections: file.collections.length,
                notes: Object.keys(file.notes).length,
                keywords: file.keywords.length,
            })}.`,
        });
    };

    const importData = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setMessage(null);

        if (file.size > MAX_FILE_SIZE) {
            setMessage({ type: 'error', text: 'File quá lớn (tối đa 2 MB).' });
            return;
        }

        setBusy(true);
        try {
            const parsed = parseBackup(await file.text(), user.id);
            const ok = window.confirm(
                `Khôi phục dữ liệu từ file?\n\nFile có: ${summarize(parsed.counts)}.\n` +
                'Dữ liệu hiện tại của các mục này sẽ bị thay bằng dữ liệu trong file.'
            );
            if (!ok) return;

            applyBackup(user.id, parsed.data);
            const note = parsed.skipped > 0 ? ` Đã bỏ qua ${parsed.skipped} mục không còn hợp lệ.` : '';
            setMessage({ type: 'success', text: `Đã khôi phục dữ liệu.${note} Đang tải lại trang...` });
            // Các hook đã nạp dữ liệu cũ khi mở trang, tải lại để mọi nơi đọc dữ liệu mới
            window.setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof BackupError ? err.message : 'Không đọc được file. Hãy chọn đúng file đã xuất.',
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="acc-data" aria-labelledby="acc-data-title">
            <h2 id="acc-data-title" className="acc-data-title">
                Dữ liệu của bạn
            </h2>
            <p className="acc-data-desc">
                Sao lưu bài đã lưu, bộ sưu tập, ghi chú và các mục theo dõi thành một file JSON, hoặc khôi phục từ file
                đã sao lưu. Dữ liệu chỉ nằm trong trình duyệt này nên nên sao lưu trước khi xóa dữ liệu trình duyệt.
            </p>

            {message && (
                <p
                    className={message.type === 'success' ? 'auth-success' : 'auth-alert'}
                    role={message.type === 'success' ? 'status' : 'alert'}
                >
                    {message.text}
                </p>
            )}

            <div className="acc-data-actions">
                <button type="button" className="acc-btn" onClick={exportData} disabled={busy}>
                    Xuất dữ liệu
                </button>
                <button type="button" className="acc-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
                    Nhập dữ liệu
                </button>
                <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importData} />
            </div>
        </section>
    );
}