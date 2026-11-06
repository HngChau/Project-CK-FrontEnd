// Từ viết hoa chỉ vì đứng đầu câu, không phải tên riêng.
const SENTENCE_OPENERS = new Set([
    'theo', 'tại', 'trong', 'sau', 'khi', 'với', 'để', 'từ', 'hôm', 'ngày', 'một', 'các',
    'những', 'nhiều', 'đây', 'đó', 'ông', 'bà', 'anh', 'chị', 'cô', 'chú', 'bác', 'em',
    'việc', 'nếu', 'vì', 'do', 'tuy', 'dù', 'mặc', 'còn', 'và', 'nhưng', 'thế', 'thay',
    'cũng', 'đã', 'sẽ', 'đang', 'mới', 'hiện', 'trước', 'cùng', 'bên', 'ngoài', 'nhờ',
    'qua', 'vào', 'ra', 'lên', 'xuống', 'hơn', 'gần', 'khoảng', 'đáng', 'cựu',
]);

// Danh xưng đứng trước tên người, bỏ đi khi cụm có từ hai chữ trở lên ("Ông Trump" thành "Trump").
const HONORIFICS = new Set(['ông', 'bà', 'ngài']);

// Cụm không có giá trị làm tag.
const STOP_TAGS = new Set(['dân trí', 'báo dân trí']);

// Điểm ngắt câu: dấu kết thúc câu, xuống dòng, hai chấm, gạch ngang có khoảng trắng, ngoặc và nháy.
const SPLIT = /[.!?…]+\s+|\n+|[:;]\s+|\s[-–—]\s|[“"‘()]/;
const WORD = /[\p{L}\p{N}]+(?:['’.][\p{L}\p{N}]+)*/gu;

const isCapitalized = (word: string): boolean => /^\p{Lu}/u.test(word);

interface Candidate {
    text: string;
    count: number;
    order: number;
}

export function extractTags(text: string, max = 5): string[] {
    const found = new Map<string, Candidate>();
    let order = 0;

    const flush = (run: string[], atSentenceStart: boolean): void => {
        let words = run.slice();
        if (words.length === 0) return;
        if (atSentenceStart && SENTENCE_OPENERS.has(words[0].toLowerCase())) words = words.slice(1);
        while (words.length > 1 && HONORIFICS.has(words[0].toLowerCase())) words = words.slice(1);
        if (words.length === 0 || words.length > 4) return;
        // Một từ đứng đầu câu thì chưa chắc là tên riêng.
        if (words.length === 1 && atSentenceStart && words[0] === run[0]) return;
        const phrase = words.join(' ');
        const key = phrase.toLowerCase();
        if (key.length < 2 || STOP_TAGS.has(key)) return;
        const hit = found.get(key);
        if (hit) hit.count += 1;
        else found.set(key, { text: phrase, count: 1, order: order++ });
    };

    for (const sentence of text.split(SPLIT)) {
        const matches = Array.from(sentence.matchAll(WORD));
        let run: string[] = [];
        let runAtStart = false;
        let prevEnd = 0;

        matches.forEach((m, i) => {
            const word = m[0];
            const index = m.index ?? 0;
            if (isCapitalized(word)) {
                const contiguous = run.length > 0 && /^\s+$/.test(sentence.slice(prevEnd, index));
                if (!contiguous) {
                    flush(run, runAtStart);
                    run = [];
                    runAtStart = i === 0;
                }
                run.push(word);
            } else {
                flush(run, runAtStart);
                run = [];
            }
            prevEnd = index + word.length;
        });
        flush(run, runAtStart);
    }

    const candidates = Array.from(found.entries());
    const contains = (longer: string, shorter: string): boolean =>
        longer !== shorter && (' ' + longer + ' ').includes(' ' + shorter + ' ');

    return candidates
        // Bỏ cụm ngắn đã nằm trong cụm dài xuất hiện không ít hơn ("Thái" trong "Thái Lan").
        .filter(([key, c]) => !candidates.some(([other, o]) => contains(other, key) && o.count >= c.count))
        .map(([, c]) => c)
        .sort((a, b) => b.count - a.count || a.order - b.order)
        .slice(0, max)
        .map((c) => c.text);
}