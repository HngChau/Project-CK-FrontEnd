import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getInitials } from '../components/UserMenu';
import { useAuth } from '../context/AuthContext';
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
};

const NAV_ITEMS = [
    { to: '/tai-khoan', label: 'Thông tin tài khoản', icon: ICONS.user },
    { to: '/hoat-dong-binh-luan', label: 'Hoạt động bình luận', icon: ICONS.comment },
    { to: '/ban-tin-cua-toi', label: 'Bảng tin của bạn', icon: ICONS.board },
    { to: '/tin-da-xem', label: 'Tin đã xem', icon: ICONS.viewed },
    { to: '/da-luu', label: 'Tin đã lưu', icon: ICONS.saved },
];

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
    saveDisabled: boolean;
    saving?: boolean;
    cancelLabel?: string;
    saveLabel?: string;
    onSave: () => void;
    onCancel: () => void;
}

function Editor({
                    children,
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

type EditingField = 'name' | 'email' | 'password' | null;

export default function AccountPage() {
    const { user, logout, updateName, updateEmail, changePassword } = useAuth();
    const navigate = useNavigate();

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

    if (!user) return null;

    const startEdit = (field: Exclude<EditingField, null>) => {
        setNotice('');
        setNameError('');
        setEmailError('');
        setEmailPw('');
        setEmailPwError('');
        setPwErrors({});
        setName(user.name);
        setEmail(user.email);
        setPw(EMPTY_PW);
        setEditing(field);
    };

    const cancel = () => setEditing(null);

    const handleLogout = () => {
        navigate('/', { replace: true });
        logout();
    };

    const nameTooLong = name.trim().length > NAME_MAX;

    const handleNameChange = (value: string) => {
        setName(value);
        setNameError(validateName(value));
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

    return (
        <div className="acc">
            <aside className="acc-nav" aria-label="Tài khoản">
                {NAV_ITEMS.map((item) => (
                    <NavLink key={item.to} to={item.to} end className="acc-nav-link">
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <hr className="acc-nav-divider" />
                <button type="button" className="acc-nav-link" onClick={handleLogout}>
                    {ICONS.logout}
                    <span>Đăng xuất</span>
                </button>
            </aside>

            <div className="acc-main">
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
                                saveDisabled={!name.trim() || nameTooLong || name.trim() === user.name}
                            >
                                <div className="auth-field">
                                    <label htmlFor="acc-name">Tên hiển thị</label>
                                    <div className="auth-password">
                                        <input
                                            id="acc-name"
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
            </div>
        </div>
    );
}