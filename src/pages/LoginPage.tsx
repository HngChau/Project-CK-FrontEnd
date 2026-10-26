import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { LoginInput } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(form);
      const from = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <form className="auth" onSubmit={submit}>
      <h1>Đăng nhập</h1>
      <label>Email
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label>Mật khẩu
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </label>
      {error && <p className="status error">{error}</p>}
      <button type="submit">Đăng nhập</button>
      <p>Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link></p>
    </form>
  );
}
