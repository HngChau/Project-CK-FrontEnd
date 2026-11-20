import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildBackup, downloadBackup } from '../services/dataBackup';
import '../pages/auth.css';

// Khối "Dữ liệu của bạn": sao lưu ra file JSON
export default function DataBackup() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');

    if (!user) return null;

    const exportData = () => {
        const file = buildBackup(user.id);
        downloadBackup(file);
        setMessage(
            `Đã xuất dữ liệu: ${file.bookmarks.length} bài đã lưu, ${file.collections.length} bộ sưu tập, ` +
            `${Object.keys(file.notes).length} ghi chú, ${file.keywords.length} từ khóa theo dõi.`
        );
    };

    return (
        <section className="acc-data" aria-labelledby="acc-data-title">
            <h2 id="acc-data-title" className="acc-data-title">
                Dữ liệu của bạn
            </h2>
            <p className="acc-data-desc">
                Sao lưu bài đã lưu, bộ sưu tập, ghi chú và các mục theo dõi thành một file JSON. Dữ liệu chỉ nằm trong
                trình duyệt này nên nên sao lưu trước khi xóa dữ liệu trình duyệt.
            </p>

            {message && (
                <p className="auth-success" role="status">
                    {message}
                </p>
            )}

            <div className="acc-data-actions">
                <button type="button" className="acc-btn" onClick={exportData}>
                    Xuất dữ liệu
                </button>
            </div>
        </section>
    );
}