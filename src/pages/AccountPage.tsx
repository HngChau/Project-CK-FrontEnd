import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { getInitials } from '../components/UserMenu';
import { useAuth } from '../context/AuthContext';
import UserCommentActivity from '../components/UserCommentActivity';
import {
    AuthError,
    NAME_MAX,
    normalizeEmail,
    validateEmail,
    validateName,
    validatePassword,
} from '../services/auth';
import type { FormErrors } from '../services/auth';
import './auth.css';
import './profile.css';
import AccountNav from "../components/AccountNav";

function Icon({ children, size = 26 }: { children: ReactNode; size?: number }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const ICONS = {
    user: (
        <Icon>
            <circle cx="9" cy="8" r="4" />
            <path d="M2 21c0-4 3-6.5 7-6.5 1.2 0 2.3.2 3.3.7" />
            <path d="M14.5 20.5l.5-2.5 5-5a1.4 1.4 0 012 2l-5 5-2.5.5z" />
        </Icon>
    ),
    comment: (
        <Icon>
            <rect x="3" y="4" width="18" height="14" rx="3" />
            <path d="M7 9h10M7 13h6M9 18v3l4-3" />
        </Icon>
    ),
    board: (
        <Icon>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M12 7l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" />
        </Icon>
    ),
    viewed: (
        <Icon>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M7 9h2M12 9h5M7 14h10" />
        </Icon>
    ),
    saved: (
        <Icon>
            <path d="M6 3h12v18l-6-4.5L6 21z" />
        </Icon>
    ),
    logout: (
        <Icon>
            <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" />
            <path d="M15 8l4 4-4 4M19 12H9" />
        </Icon>
    ),
    mail: (
        <Icon>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="M4 8l8 6 8-6" />
        </Icon>
    ),
    key: (
        <Icon>
            <circle cx="8" cy="15" r="4" />
            <path d="M11 12l9-9M16 7l3 3" />
        </Icon>
    ),
    camera: (
        <Icon size={22}>
            <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
            <circle cx="12" cy="13" r="3.2" />
        </Icon>
    ),

    idcard: (
        <Icon>
            <rect x="4" y="3" width="16" height="18" rx="4" />
            <circle cx="12" cy="10" r="3" />
            <path d="M6.5 19c.8-2.4 2.9-3.8 5.5-3.8s4.7 1.4 5.5 3.8" />
        </Icon>
    ),
    birthday: (
        <Icon>
            <path d="M12 3v3M9 4.5c0 .8.7 1.5 1.5 1.5M15 4.5c0 .8-.7 1.5-1.5 1.5" />
            <rect x="5" y="9" width="14" height="5" rx="1.5" />
            <path d="M4 14h16v6H4zM4 17c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0" />
        </Icon>
    ),
    gender: (
        <Icon>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5z" />
            <path d="M15.5 4.8a3.5 3.5 0 010 6.4M18 14.8c1.9.7 3 2.3 3 5.2" />
        </Icon>
    ),
    phone: (
        <Icon>
            <path d="M5 4h4l1.5 4-2 1.5a11 11 0 006 6L16 13.5l4 1.5v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" />
        </Icon>
    ),
    address: (
        <Icon>
            <path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0113 0C18.5 15.3 12 21 12 21z" />
            <circle cx="12" cy="10" r="2.5" />
        </Icon>
    ),
};

type PwField = 'current' | 'next' | 'confirm';
type PwValues = Record<PwField, string>;
const EMPTY_PW: PwValues = { current: '', next: '', confirm: '' };

function checkPassword(v: PwValues): FormErrors {
    const e: FormErrors = {};
    if (!v.current) e.current = 'Vui lòng nhập mật khẩu hiện tại';
    const nextError = validatePassword(v.next);
    if (nextError) e.next = nextError;
    else if (v.next === v.current) e.next = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    if (!v.confirm) e.confirm = 'Vui lòng nhập lại mật khẩu mới';
    else if (v.confirm !== v.next) e.confirm = 'Mật khẩu nhập lại không khớp';
    return e;
}

const PW_FIELD_MAP: Record<string, PwField | 'form'> = {
    currentPassword: 'current',
    newPassword: 'next',
};


type Gender = '' | 'male' | 'female' | 'other';

interface PersonalInfo {
    birthday: string;
    gender: Gender;
    phone: string;
    address: string;
}

type InfoField = keyof PersonalInfo;

const EMPTY_INFO: PersonalInfo = { birthday: '', gender: '', phone: '', address: '' };

const GENDER_LABEL: Record<Exclude<Gender, ''>, string> = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
};

const ADDRESS_MAX = 200;
const PHONE_RE = /^(0|\+84)\d{9}$/;

const infoKey = (email: string) => `personal-info:${email}`;

function loadInfo(email?: string): PersonalInfo {
    if (!email) return EMPTY_INFO;
    try {
        const raw = localStorage.getItem(infoKey(email));
        return raw ? { ...EMPTY_INFO, ...JSON.parse(raw) } : EMPTY_INFO;
    } catch {
        return EMPTY_INFO;
    }
}

function saveInfo(email: string, data: PersonalInfo) {
    try {
        localStorage.setItem(infoKey(email), JSON.stringify(data));
    } catch {
     // bỏ qua nếu trình duyệt chặn localStorage
    }
}

function validateBirthday(v: string): string {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime()) || d.getFullYear() < 1900) return 'Ngày sinh không hợp lệ';
    if (d > new Date()) return 'Ngày sinh không được ở tương lai';
    return '';
}

function validatePhone(v: string): string {
    const s = v.trim();
    if (!s) return '';
    return PHONE_RE.test(s) ? '' : 'Số điện thoại không hợp lệ (VD: 0912345678)';
}

function validateAddress(v: string): string {
    return v.trim().length > ADDRESS_MAX ? `Địa chỉ tối đa ${ADDRESS_MAX} ký tự` : '';
}


const INFO_VALIDATORS: Record<InfoField, (v: string) => string> = {
    birthday: validateBirthday,
    gender: () => '',
    phone: validatePhone,
    address: validateAddress,
};

const INFO_NOTICE: Record<InfoField, string> = {
    birthday: 'Cập nhật ngày sinh thành công',
    gender: 'Cập nhật giới tính thành công',
    phone: 'Cập nhật số điện thoại thành công',
    address: 'Cập nhật địa chỉ thành công',
};

function formatBirthday(v: string): string {
    if (!v) return '';
    const [y, m, d] = v.split('-');
    return y && m && d ? `${d}/${m}/${y}` : '';
}

function orEmpty(v: string): ReactNode {
    return v || <span className="acc-empty">Chưa có thông tin</span>;
}

const PROVIDERS: Array<{ id: string; name: string; logo: ReactNode }> = [
    {
        id: 'google',
        name: 'Google',
        logo: (
            <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
        ),
    },
    {
        id: 'facebook',
        name: 'Facebook',
        logo: (
            <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                <circle cx="24" cy="24" r="24" fill="#1877F2" />
                <path fill="#fff" d="M33.3 30.9l1.1-6.9h-6.6v-4.5c0-1.9.9-3.7 3.9-3.7h3V10s-2.7-.5-5.3-.5c-5.4 0-8.9 3.3-8.9 9.3V24h-6v6.9h6V48h7.4V30.9z" />
            </svg>
        ),
    },
    {
        id: 'apple',
        name: 'Apple',
        logo: (
            <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
                <circle cx="12" cy="12" r="12" fill="#fff" />
                <g transform="translate(4 3.5) scale(0.66)">
                    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
                </g>
            </svg>
        ),
    },
];

interface PasswordInputProps {
    id: string;
    label: string;
    placeholder: string;
    autoComplete: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}

function PasswordInput({ id, label, placeholder, autoComplete, value, error, onChange }: PasswordInputProps) {
    const [show, setShow] = useState(false);
    return (
        <div className="auth-field">
            <label htmlFor={id}>
                {label} <span className="auth-req">*</span>
            </label>
            <div className="auth-password">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    value={value}
                    aria-invalid={Boolean(error)}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-pressed={show}
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
                        <circle cx="12" cy="12" r="3.2" />
                        {show && <path d="M3 3l18 18" />}
                    </svg>
                </button>
            </div>
            {error && <span className="auth-error">{error}</span>}
        </div>
    );
}

interface EditorProps {
    children: ReactNode;
    footer?: ReactNode;
    saveDisabled: boolean;
    saving?: boolean;
    cancelLabel?: string;
    saveLabel?: string;
    onSave: () => void;
    onCancel: () => void;
}

function Editor({
                    children,
                    footer,
                    saveDisabled,
                    saving = false,
                    cancelLabel = 'Hủy',
                    saveLabel = 'Lưu',
                    onSave,
                    onCancel,
                }: EditorProps) {
    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave();
    };
    return (
        <form className="acc-edit" onSubmit={submit} noValidate>
            {children}
            <div className="acc-actions">
                <button type="button" className="acc-btn" onClick={onCancel}>
                    {cancelLabel}
                </button>
                <button type="submit" className="acc-btn acc-btn-primary" disabled={saveDisabled || saving}>
                    {saving ? 'Đang lưu...' : saveLabel}
                </button>
            </div>
            {footer}
        </form>
    );
}

interface RowProps {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    editLabel?: string;
    editing: boolean;
    onEdit: () => void;
    children: ReactNode;
}

function AccountRow({ icon, label, value, editLabel = 'Chỉnh sửa', editing, onEdit, children }: RowProps) {
    return (
        <div className="acc-row">
            <span className="acc-icon" aria-hidden="true">
                {icon}
            </span>
            <div className="acc-body">
                {editing ? (
                    children
                ) : (
                    <div className="acc-line">
                        <div className="acc-text">
                            <span className="acc-label">{label}</span>
                            <span className="acc-value">{value}</span>
                        </div>
                        <button type="button" className="acc-edit-link" onClick={onEdit}>
                            {editLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

type EditingField = 'name' | 'fullname' |'email' | 'password' | InfoField | null;

export default function AccountPage() {
    const { user, updateName, updateEmail, changePassword } = useAuth();
    const isCommentTab = location.pathname === '/hoat-dong-binh-luan';

    const [editing, setEditing] = useState<EditingField>(null);
    const [notice, setNotice] = useState('');

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailPw, setEmailPw] = useState('');
    const [emailPwError, setEmailPwError] = useState('');
    const [emailSaving, setEmailSaving] = useState(false);

    const [pw, setPw] = useState<PwValues>(EMPTY_PW);
    const [pwErrors, setPwErrors] = useState<FormErrors>({});
    const [pwSaving, setPwSaving] = useState(false);

    const [info, setInfo] = useState<PersonalInfo>(() => loadInfo(user?.email));
    const [infoValue, setInfoValue] = useState('');
    const [infoError, setInfoError] = useState('');

    if (!user) return null;

    const startEdit = (field: Exclude<EditingField, null>) => {
        setNotice('');
        setNameError('');
        setEmailError('');
        setEmailPw('');
        setEmailPwError('');
        setPwErrors({});
        setInfoError('');
        setName(user.name);
        setEmail(user.email);
        setPw(EMPTY_PW);
        setEditing(field);
    };

    const startEditInfo = (field: InfoField) => {
        startEdit(field);
        setInfoValue(info[field]);
    };

    const cancel = () => setEditing(null);

    const nameTooLong = name.trim().length > NAME_MAX;

    const handleNameChange = (value: string) => {
        setName(value);
        setNameError(value.trim() ? validateName(value) : 'Vui lòng nhập đủ thông tin');
    };

    const saveName = () => {
        try {
            updateName(name);
            setEditing(null);
            setNotice('Cập nhật tên hiển thị thành công');
        } catch (err) {
            setNameError(err instanceof Error ? err.message : 'Cập nhật thất bại');
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setEmailError(validateEmail(value));
    };

    const handleEmailPwChange = (value: string) => {
        setEmailPw(value);
        setEmailPwError(value ? '' : 'Vui lòng nhập mật khẩu hiện tại');
    };

    const saveEmail = async () => {
        setEmailSaving(true);
        try {
            await updateEmail(email, emailPw);
            setEditing(null);
            setNotice('Cập nhật email thành công');
        } catch (err) {
            if (err instanceof AuthError && err.field === 'currentPassword') {
                setEmailPwError(err.message);
            } else {
                setEmailError(err instanceof Error ? err.message : 'Cập nhật thất bại');
            }
        } finally {
            setEmailSaving(false);
        }
    };

    const handlePwChange = (field: PwField, value: string) => {
        const updated = { ...pw, [field]: value };
        setPw(updated);

        const all = checkPassword(updated);
        const shown: FormErrors = {};
        for (const key of Object.keys(all)) {
            if (key === field || updated[key as PwField] !== '') shown[key] = all[key];
        }
        setPwErrors(shown);
    };

    const savePassword = async () => {
        const found = checkPassword(pw);
        setPwErrors(found);
        if (Object.keys(found).length > 0) return;

        setPwSaving(true);
        try {
            await changePassword(pw.current, pw.next);
            setEditing(null);
            setNotice('Đổi mật khẩu thành công');
        } catch (err) {
            if (err instanceof AuthError) {
                setPwErrors({ [PW_FIELD_MAP[err.field] ?? 'form']: err.message });
            } else {
                setPwErrors({ form: err instanceof Error ? err.message : 'Đổi mật khẩu thất bại' });
            }
        } finally {
            setPwSaving(false);
        }
    };

    const handleInfoChange = (field: InfoField, value: string) => {
        setInfoValue(value);
        setInfoError(INFO_VALIDATORS[field](value));
    };

    const saveInfoField = (field: InfoField) => {
        const value = infoValue.trim();
        const err = INFO_VALIDATORS[field](value);
        if (err) {
            setInfoError(err);
            return;
        }
        const next = { ...info, [field]: value } as PersonalInfo;
        saveInfo(user.email, next);
        setInfo(next);
        setEditing(null);
        setNotice(INFO_NOTICE[field]);
    };


    const infoEditor = (field: InfoField) => ({
        onSave: () => saveInfoField(field),
        onCancel: cancel,
        cancelLabel: 'Hủy bỏ',
        saveLabel: 'Xác nhận',
        saveDisabled: Boolean(infoError) || infoValue.trim() === info[field],
    });

    return (
        <div className="acc">
            <AccountNav/>

            <div className="acc-main">
                {isCommentTab ? ( /* tab Hoạt động bình luận */
                    <>
                        <h1 className="acc-title">Hoạt động bình luận</h1>
                        <UserCommentActivity />
                    </>
                ) : (
                    <>
                        {notice && (
                            <p className="auth-success" role="status">
                                {notice}
                            </p>
                        )}

                        <section className="acc-profile">
                            <div className="acc-avatar-wrap">
                        <span className="acc-avatar" aria-hidden="true">
                            {getInitials(user.name)}
                        </span>
                                <button
                                    type="button"
                                    className="acc-camera"
                                    disabled
                                    title="Chưa hỗ trợ trong bản demo"
                                    aria-label="Đổi ảnh đại diện"
                                >
                                    {ICONS.camera}
                                </button>
                            </div>

                    <div className="acc-profile-body">
                        {editing === 'name' ? (
                            <Editor
                                onSave={saveName}
                                onCancel={cancel}
                                cancelLabel="Hủy bỏ"
                                saveLabel="Xác nhận"
                                saveDisabled={!name.trim() || nameTooLong || name.trim() === user.name}
                                footer={
                                    <p className="acc-hint">
                                        Tối đa <strong>{NAME_MAX}</strong> ký tự
                                        <br />
                                        <strong>Không</strong> được sử dụng <strong>ký tự đặc biệt</strong>
                                    </p>
                                }
                            >
                                <div className="auth-field">
                                    <label htmlFor="acc-name">Tên hiển thị</label>
                                    <div className="auth-password">
                                        <input
                                            id="acc-name"
                                            type="text"
                                            placeholder="Nhập tên hiển thị"
                                            autoComplete="name"
                                            autoFocus
                                            value={name}
                                            aria-invalid={Boolean(nameError)}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                        />
                                        <span className={`auth-count${nameTooLong ? ' is-over' : ''}`}>
                                            {name.length}/{NAME_MAX}
                                        </span>
                                            </div>
                                            {nameError && <span className="auth-error">{nameError}</span>}
                                        </div>
                                    </Editor>
                                ) : (
                                    <div className="acc-line">
                                        <div className="acc-text">
                                            <span className="acc-label">Tên hiển thị</span>
                                            <span className="acc-name">{user.name}</span>
                                        </div>
                                        <button type="button" className="acc-edit-link" onClick={() => startEdit('name')}>
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        <h1 className="acc-title">Quản lý tài khoản</h1>

                <AccountRow
                    icon={ICONS.mail}
                    label="Email"
                    value={user.email}
                    editLabel="Đổi email"
                    editing={editing === 'email'}
                    onEdit={() => startEdit('email')}
                >
                    <Editor
                        onSave={saveEmail}
                        onCancel={cancel}
                        saving={emailSaving}
                        cancelLabel="Hủy bỏ"
                        saveLabel="Xác nhận"
                        saveDisabled={
                            !email.trim() ||
                            Boolean(validateEmail(email)) ||
                            normalizeEmail(email) === user.email ||
                            !emailPw
                        }
                    >
                        <div className="auth-field">
                            <label htmlFor="acc-email">
                                Nhập email mới <span className="auth-req">*</span>
                            </label>
                            <input
                                id="acc-email"
                                type="email"
                                placeholder="Nhập Email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                aria-invalid={Boolean(emailError)}
                                onChange={(e) => handleEmailChange(e.target.value)}
                            />
                            {emailError && <span className="auth-error">{emailError}</span>}
                        </div>
                        <PasswordInput
                            id="acc-email-pw"
                            label="Nhập mật khẩu hiện tại để xác thực"
                            placeholder="Nhập mật khẩu hiện tại"
                            autoComplete="current-password"
                            value={emailPw}
                            error={emailPwError}
                            onChange={handleEmailPwChange}
                        />
                    </Editor>
                </AccountRow>

                <AccountRow
                    icon={ICONS.key}
                    label="Mật khẩu"
                    value={<span className="acc-dots">••••••••••</span>}
                    editLabel="Đổi mật khẩu"
                    editing={editing === 'password'}
                    onEdit={() => startEdit('password')}
                >
                    <Editor
                        onSave={savePassword}
                        onCancel={cancel}
                        saving={pwSaving}
                        saveDisabled={!pw.current || !pw.next || !pw.confirm}
                    >
                        {pwErrors.form && (
                            <p className="auth-alert" role="alert">
                                {pwErrors.form}
                            </p>
                        )}
                        <PasswordInput
                            id="acc-pw-current"
                            label="Mật khẩu hiện tại"
                            placeholder="Nhập mật khẩu hiện tại"
                            autoComplete="current-password"
                            value={pw.current}
                            error={pwErrors.current}
                            onChange={(v) => handlePwChange('current', v)}
                        />
                        <PasswordInput
                            id="acc-pw-next"
                            label="Mật khẩu mới"
                            placeholder="Nhập mật khẩu mới (6 - 29 ký tự)"
                            autoComplete="new-password"
                            value={pw.next}
                            error={pwErrors.next}
                            onChange={(v) => handlePwChange('next', v)}
                        />
                        <PasswordInput
                            id="acc-pw-confirm"
                            label="Nhập lại mật khẩu mới"
                            placeholder="Nhập lại mật khẩu mới"
                            autoComplete="new-password"
                            value={pw.confirm}
                            error={pwErrors.confirm}
                            onChange={(v) => handlePwChange('confirm', v)}
                        />
                    </Editor>
                </AccountRow>

                <div className="acc-links">
                    <span className="acc-links-title">Liên kết tài khoản</span>
                    <ul className="acc-links-list">
                        {PROVIDERS.map((p) => (
                            <li key={p.id} className="acc-link-item">
                                <span className="acc-link-logo">{p.logo}</span>
                                <span className="acc-link-name">{p.name}</span>
                                <button type="button" className="acc-link-btn">
                                    Kết nối
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="acc-links-note">Sau khi liên kết, bạn có thể đăng nhập bằng tài khoản mạng xã hội</p>
                </div>

                <h1 className="acc-title">Thông tin cá nhân</h1>

                <AccountRow
                    icon={ICONS.idcard}
                    label="Họ và tên"
                    value={user.name}
                    editing={editing === 'fullname'}
                    onEdit={() => startEdit('fullname')}
                >
                    <Editor
                        onSave={saveName}
                        onCancel={cancel}
                        cancelLabel="Hủy bỏ"
                        saveLabel="Xác nhận"
                        saveDisabled={!name.trim() || nameTooLong || name.trim() === user.name}
                    >
                        <div className="auth-field">
                            <label htmlFor="acc-fullname">Họ và tên <span className="auth-req">*</span> </label>
                            <div className="auth-password">
                                <input
                                    id="acc-fullname"
                                    type="text"
                                    placeholder="Nhập họ và tên"
                                    autoComplete="name"
                                    autoFocus
                                    value={name}
                                    aria-invalid={Boolean(nameError)}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                                <span className={`auth-count${nameTooLong ? ' is-over' : ''}`}>
                    {name.length}/{NAME_MAX}
                </span>
                            </div>
                            {nameError && <span className="auth-error">{nameError}</span>}
                        </div>
                    </Editor>
                </AccountRow>

                <AccountRow
                    icon={ICONS.birthday}
                    label="Ngày sinh"
                    value={orEmpty(formatBirthday(info.birthday))}
                    editing={editing === 'birthday'}
                    onEdit={() => startEditInfo('birthday')}
                >
                    <Editor {...infoEditor('birthday')}>
                        <div className="auth-field">
                            <label htmlFor="acc-birthday">Ngày sinh</label>
                            <input
                                id="acc-birthday"
                                type="date"
                                autoFocus
                                max={new Date().toISOString().slice(0, 10)}
                                value={infoValue}
                                aria-invalid={Boolean(infoError)}
                                onChange={(e) => handleInfoChange('birthday', e.target.value)}
                            />
                            {infoError && <span className="auth-error">{infoError}</span>}
                        </div>
                    </Editor>
                </AccountRow>

                <AccountRow
                    icon={ICONS.gender}
                    label="Giới tính"
                    value={orEmpty(info.gender ? GENDER_LABEL[info.gender] : '')}
                    editing={editing === 'gender'}
                    onEdit={() => startEditInfo('gender')}
                >
                    <Editor {...infoEditor('gender')}>
                        <div className="auth-field">
                            <span className="pi-radios-label" id="acc-gender-label">Giới tính</span>
                            <div className="pi-radios" role="radiogroup" aria-labelledby="acc-gender-label">
                                {(Object.keys(GENDER_LABEL) as Array<Exclude<Gender, ''>>).map((g) => (
                                    <label key={g} className="pi-radio">
                                        <input
                                            type="radio"
                                            name="acc-gender"
                                            value={g}
                                            checked={infoValue === g}
                                            onChange={() => handleInfoChange('gender', g)}
                                        />
                                        <span>{GENDER_LABEL[g]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </Editor>
                </AccountRow>

                <AccountRow
                    icon={ICONS.phone}
                    label="Số điện thoại"
                    value={orEmpty(info.phone)}
                    editing={editing === 'phone'}
                    onEdit={() => startEditInfo('phone')}
                >
                    <Editor {...infoEditor('phone')}>
                        <div className="auth-field">
                            <label htmlFor="acc-phone">Số điện thoại</label>
                            <input
                                id="acc-phone"
                                type="tel"
                                inputMode="tel"
                                placeholder="Nhập số điện thoại"
                                autoComplete="tel"
                                autoFocus
                                value={infoValue}
                                aria-invalid={Boolean(infoError)}
                                onChange={(e) => handleInfoChange('phone', e.target.value.replace(/[^\d+]/g, ''))}
                            />
                            {infoError && <span className="auth-error">{infoError}</span>}
                        </div>
                    </Editor>
                </AccountRow>

                <AccountRow
                    icon={ICONS.address}
                    label="Địa chỉ"
                    value={orEmpty(info.address)}
                    editing={editing === 'address'}
                    onEdit={() => startEditInfo('address')}
                >
                    <Editor {...infoEditor('address')}>
                        <div className="auth-field">
                            <label htmlFor="acc-address">Địa chỉ</label>
                            <input
                                id="acc-address"
                                type="text"
                                placeholder="Nhập địa chỉ"
                                autoComplete="street-address"
                                autoFocus
                                value={infoValue}
                                aria-invalid={Boolean(infoError)}
                                onChange={(e) => handleInfoChange('address', e.target.value)}
                            />
                            {infoError && <span className="auth-error">{infoError}</span>}
                        </div>
                    </Editor>
                </AccountRow>
                    </>
                    )}
            </div>
        </div>
    );
}