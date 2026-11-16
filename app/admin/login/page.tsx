import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Đăng nhập quản trị | The No. 7 Archive" };

export default function AdminLoginPage() {
  return <div className="site-shell site-shell--admin">
    <PageHeader active="admin" />
    <main className="page-wrap login-layout">
      <section className="login-story" aria-labelledby="login-title">
        <span className="eyebrow"><i className="eyebrow__dot" /> PRIVATE COLLECTION</span>
        <h1 id="login-title">Mỗi khoảnh khắc<br />đều <em>đáng lưu giữ.</em></h1>
        <p>Khu vực dành riêng cho người quản trị thư viện The No. 7 Archive.</p>
        <div className="login-story__mark" aria-hidden="true">7<span>ARCHIVE / ADMIN</span></div>
        <Link className="back-link" href="/gallery">← Trở về thư viện</Link>
      </section>
      <section className="login-card" aria-labelledby="form-title">
        <div className="login-card__top"><span className="eyebrow">ADMIN ACCESS</span><span className="secure-mark"><i /> SECURE SESSION</span></div>
        <h2 id="form-title">Chào mừng trở lại</h2>
        <p className="login-card__intro">Đăng nhập để tiếp tục quản lý bộ sưu tập.</p>
        <LoginForm />
        <div className="login-card__bottom"><span>THE NO. 7 ARCHIVE</span><span>01 / 01</span></div>
      </section>
    </main>
    <footer className="login-footer page-wrap"><span>CRISTIANO RONALDO · PHOTO ARCHIVE</span><span>© 2026 THE NO. 7 ARCHIVE</span></footer>
  </div>;
}
