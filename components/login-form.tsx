"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, loginAdmin } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await loginAdmin(email.trim(), password);
      router.push("/admin/gallery");
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 401
        ? "Email hoặc mật khẩu chưa chính xác. Vui lòng kiểm tra và thử lại."
        : cause instanceof ApiError ? cause.message : "Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  return <form className="login-form" onSubmit={handleSubmit}>
    <label className="field-label" htmlFor="email">Email quản trị</label>
    <input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" disabled={pending} />
    <div className="field-label-row"><label className="field-label" htmlFor="password">Mật khẩu</label></div>
    <div className="password-field">
      <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" disabled={pending} />
      <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} disabled={pending}>{showPassword ? "ẨN" : "HIỆN"}</button>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button--red login-submit" type="submit" disabled={pending}>
      {pending ? <><i className="spinner spinner--light" /> Đang xác thực</> : <>Đăng nhập <span aria-hidden="true">↗</span></>}
    </button>
    <p className="form-footnote">Phiên làm việc được bảo vệ bằng xác thực cookie và CSRF.</p>
  </form>;
}
