import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { AuthLocationState } from '../components/AuthDialog';
import { useAuth } from '../context/AuthContext';
import { AuthError, validateLoginForm, validateEmail, validatePassword } from '../services/auth';
import type { FormErrors } from '../services/auth';
import type { LoginInput } from '../types';
import './auth.css';


export default function LoginPage() {
    const { user, login } = useAuth();
    const location = useLocation();
    const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const from = (location.state as AuthLocationState | null)?.from ?? '/';

    if (user) return <Navigate to={from} replace />;

    const filled = form.email.trim() !== '' && form.password !== '';

    const handleChange = (field: 'email' | 'password', value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));

        const message = field === 'email' ? validateEmail(value) : validatePassword(value);
        setErrors((prev) => {
            const next = { ...prev };
            delete next.form;
            if (message) next[field] = message;
            else delete next[field];
            return next;
        });
    };

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const found = validateLoginForm(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        try {
            await login(form);
        } catch (err) {
            if (err instanceof AuthError && err.field !== 'form') {
                setErrors({ [err.field]: err.message });
            } else {
                setErrors({ form: err instanceof Error ? err.message : 'Đăng nhập thất bại' });
            }
            setSubmitting(false);
        }
    };

    return (
        <>
            <p className="auth-lead">Đăng nhập với tài khoản</p>
            <div className="auth-social">
                <button type="button" disabled title="Chưa hỗ trợ trong bản demo" aria-label="Đăng nhập bằng Google">
                    <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                </button>
                <button type="button" disabled title="Chưa hỗ trợ trong bản demo" aria-label="Đăng nhập bằng Facebook">
                    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                        <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.69 4.54-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
                    </svg>
                </button>
                <button type="button" disabled title="Chưa hỗ trợ trong bản demo" aria-label="Đăng nhập bằng Apple">
                    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                        <path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                    </svg>
                </button>
            </div>

            <hr className="auth-divider" />

            <form onSubmit={submit} noValidate>
                <h1 className="auth-heading">Đăng nhập với Email</h1>

                {errors.form && (
                    <p className="auth-alert" role="alert">
                        {errors.form}
                    </p>
                )}

                <div className="auth-field">
                    <label htmlFor="login-email">
                        Email <span className="auth-req">*</span>
                    </label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Nhập Email"
                        autoComplete="email"
                        value={form.email}
                        aria-invalid={Boolean(errors.email)}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                <div className="auth-field">
                    <label htmlFor="login-password">
                        Mật khẩu <span className="auth-req">*</span>
                    </label>
                    <div className="auth-password">
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu"
                            autoComplete="current-password"
                            value={form.password}
                            aria-invalid={Boolean(errors.password)}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                        <button
                            type="button"
                            className="auth-eye"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            aria-pressed={showPassword}
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3.2" />
                                {showPassword && <path d="M3 3l18 18" />}
                            </svg>
                        </button>
                    </div>
                    {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-submit" disabled={!filled || submitting}>
                    {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>
        </>
    );
}