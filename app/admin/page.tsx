"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

const initial: { error?: string } | undefined = undefined;

export default function AdminLogin() {
  const [state, action, pending] = useActionState(login, initial);
  return <main className="admin-screen"><div className="admin-box">
    <a href="/" className="admin-brand">محمد رجب <span>· إدارة الموقع</span></a>
    <form action={action}>
      <div className="eyebrow">تسجيل دخول آمن</div>
      <h1>تسجيل الدخول.</h1>
      <p>استخدم حساب المدير الذي أنشأته في Supabase.</p>
      <label>البريد الإلكتروني<input name="email" type="email" autoComplete="username" required /></label>
      <label>كلمة المرور<input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="submit-link" disabled={pending}>{pending ? "جارٍ الدخول…" : "دخول إلى لوحة الإدارة ↙"}</button>
      {state?.error && <p className="admin-error" role="alert">{state.error}</p>}
    </form>
  </div></main>;
}
