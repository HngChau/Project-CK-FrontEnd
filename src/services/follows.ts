import { removeAccents } from './rss';

export const MAX_KEYWORDS = 20;
export const MAX_KEYWORD_LENGTH = 50;
export const MIN_KEYWORD_LENGTH = 2;

/** Kết quả thêm từ khóa: thành công, hoặc kèm thông báo lỗi để hiển thị cho người dùng. */
export type AddResult = { ok: true; keyword: string } | { ok: false; error: string };

/** Bỏ khoảng trắng thừa ở đầu, cuối và giữa các từ. */
export function cleanKeyword(raw: string): string {
    return raw.trim().replace(/\s+/g, ' ');
}

/** Khóa so sánh, không phân biệt hoa thường và dấu: "Giáo dục" và "giao duc" là một từ khóa. */
export function keywordKey(keyword: string): string {
    return removeAccents(cleanKeyword(keyword));
}

/** Kiểm tra một từ khóa định thêm. Trả về thông báo lỗi, chuỗi rỗng nếu hợp lệ. */
export function checkKeyword(raw: string, current: string[]): string {
    const k = cleanKeyword(raw);
    if (!k) return 'Vui lòng nhập từ khóa';
    if (k.length < MIN_KEYWORD_LENGTH) return `Từ khóa cần ít nhất ${MIN_KEYWORD_LENGTH} ký tự`;
    if (k.length > MAX_KEYWORD_LENGTH) return `Từ khóa tối đa ${MAX_KEYWORD_LENGTH} ký tự`;
    if (!/[\p{L}\p{N}]/u.test(k)) return 'Từ khóa phải có chữ hoặc số';
    const key = keywordKey(k);
    if (current.some((x) => keywordKey(x) === key)) return 'Bạn đã theo dõi từ khóa này';
    if (current.length >= MAX_KEYWORDS) return `Chỉ theo dõi tối đa ${MAX_KEYWORDS} từ khóa`;
    return '';
}

/** Đọc danh sách từ khóa từ dữ liệu lưu trữ: bỏ phần tử sai kiểu, rỗng, quá dài hoặc trùng. */
export function parseKeywords(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const result: string[] = [];
    const seen = new Set<string>();
    for (const item of raw) {
        if (typeof item !== 'string') continue;
        const k = cleanKeyword(item);
        const key = keywordKey(k);
        if (!k || k.length > MAX_KEYWORD_LENGTH || seen.has(key)) continue;
        seen.add(key);
        result.push(k);
        if (result.length >= MAX_KEYWORDS) break;
    }
    return result;
}