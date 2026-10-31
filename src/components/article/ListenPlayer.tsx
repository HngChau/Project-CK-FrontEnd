import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    /** Toàn bộ văn bản cần đọc: tiêu đề, tóm tắt, nội dung */
    text: string;
}

const CHARS_PER_SECOND = 15; // Ước lượng tốc độ đọc để hiển thị thời gian còn lại
const MAX_CHUNK = 180; // Chrome tự ngắt đoạn đọc dài,chia văn bản thành các đoạn ngắn rồi đọc nối tiếp

function splitChunks(text: string): string[] {
    const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
    const chunks: string[] = [];
    let cur = '';
    for (const s of sentences) {
        if (cur && (cur + s).length > MAX_CHUNK) {
            chunks.push(cur.trim());
            cur = '';
        }
        cur += s;
        while (cur.length > MAX_CHUNK) {
            let cut = cur.lastIndexOf(' ', MAX_CHUNK);
            if (cut < 40) cut = MAX_CHUNK;
            chunks.push(cur.slice(0, cut).trim());
            cur = cur.slice(cut);
        }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks;
}

function formatRemaining(seconds: number): string {
    const s = Math.max(0, Math.round(seconds));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `-${mm}:${ss}`;
}

export default function ListenPlayer({ text }: Props) {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const chunks = useMemo(() => splitChunks(text), [text]);
    const offsets = useMemo(() => {
        let acc = 0;
        return chunks.map((c) => {
            const start = acc;
            acc += c.length + 1;
            return start;
        });
    }, [chunks]);
    const total = useMemo(() => chunks.reduce((n, c) => n + c.length + 1, 0), [chunks]);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [voiceURI, setVoiceURI] = useState('');
    const [playing, setPlaying] = useState(false);
    const [spoken, setSpoken] = useState(0);
    const token = useRef(0); // đổi mỗi lần dừng/bắt đầu để bỏ qua callback của lượt đọc cũ
    const chunkIdx = useRef(0); // đoạn đang đọc, dùng để tiếp tục sau khi tạm dừng

    // Danh sách giọng tiếng Việt (trình duyệt nạp bất đồng bộ).
    useEffect(() => {
        if (!supported) return;
        const load = () => {
            const vi = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('vi'));
            setVoices(vi);
            setVoiceURI((prev) => prev || vi[0]?.voiceURI || '');
        };
        load();
        window.speechSynthesis.addEventListener('voiceschanged', load);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
    }, [supported]);

    // Đổi bài viết hoặc rời trang thì dừng đọc và đặt lại tiến độ
    useEffect(() => {
        chunkIdx.current = 0;
        setSpoken(0);
        setPlaying(false);
        return () => {
            token.current += 1;
            if (supported) window.speechSynthesis.cancel();
        };
    }, [chunks, supported]);

    const stop = useCallback(() => {
        token.current += 1;
        window.speechSynthesis.cancel();
        setPlaying(false);
    }, []);

    const speakFrom = useCallback(
        (start: number) => {
            const synth = window.speechSynthesis;
            token.current += 1;
            const myToken = token.current;
            synth.cancel();
            const voice = voices.find((v) => v.voiceURI === voiceURI);

            const speak = (i: number) => {
                if (myToken !== token.current) return;
                if (i >= chunks.length) {
                    chunkIdx.current = 0;
                    setSpoken(0);
                    setPlaying(false);
                    return;
                }
                chunkIdx.current = i;
                setSpoken(offsets[i]);
                const u = new SpeechSynthesisUtterance(chunks[i]);
                u.lang = 'vi-VN';
                if (voice) u.voice = voice;
                u.onboundary = (e) => {
                    if (myToken === token.current) setSpoken(offsets[i] + e.charIndex);
                };
                u.onend = () => speak(i + 1);
                u.onerror = () => {
                    if (myToken === token.current) setPlaying(false);
                };
                synth.speak(u);
            };

            setPlaying(true);
            speak(start);
        },
        [chunks, offsets, voices, voiceURI]
    );

    const toggle = () => (playing ? stop() : speakFrom(chunkIdx.current));

    if (!supported || chunks.length === 0) return null;

    const percent = total > 0 ? Math.min(100, (spoken / total) * 100) : 0;
    const remaining = (total - spoken) / CHARS_PER_SECOND;

    return (
        <div className="art-listen" role="group" aria-label="Nghe bài viết">
            <button
                type="button"
                className="art-listen-btn"
                onClick={toggle}
                aria-label={playing ? 'Tạm dừng' : 'Nghe bài viết'}
            >
                {playing ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                        <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                )}
            </button>
            <div
                className="art-listen-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(percent)}
            >
                <span style={{ width: `${percent}%` }} />
            </div>
            <span className="art-listen-time">{formatRemaining(remaining)}</span>
            {voices.length > 1 ? (
                <select
                    className="art-listen-voice"
                    value={voiceURI}
                    onChange={(e) => {
                        if (playing) stop();
                        setVoiceURI(e.target.value);
                    }}
                    aria-label="Chọn giọng đọc"
                >
                    {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                    ))}
                </select>
            ) : (
                <span
                    className="art-listen-voice"
                    title={voices.length ? voices[0].name : 'Trình duyệt chưa có giọng tiếng Việt, sẽ dùng giọng mặc định'}
                >
          {voices.length ? voices[0].name : 'Giọng mặc định'}
        </span>
            )}
        </div>
    );
}