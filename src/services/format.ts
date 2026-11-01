import type { Article } from '../types';

// VD: "Thứ bảy, 31/10/2026 - 13:08" (giờ Việt Nam), trả về chuỗi rỗng nếu ngày không hợp lệ.
export function formatFullDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const parts = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(d);
    const get = (type: Intl.DateTimeFormatPartTypes): string =>
        parts.find((p) => p.type === type)?.value ?? '';
    const weekday = get('weekday').toLowerCase();
    const day = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${day}, ${get('day')}/${get('month')}/${get('year')} - ${get('hour')}:${get('minute')}`;
}

/**
 * Đường dẫn nội bộ tới trang chi tiết bài lấy pathname để khớp route /:categorySlug/:articleSlug.
 */
export function articlePath(a: Article): string {
    try {
        const { pathname } = new URL(a.link);
        if (/\.htm$/.test(pathname)) return pathname;
    } catch {
        // link không hợp lệ, dùng đường dẫn dự phòng bên dưới
    }
    return `/bai-viet/${a.id}?c=${a.category}`;
}