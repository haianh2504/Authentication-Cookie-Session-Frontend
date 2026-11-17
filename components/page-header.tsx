import Link from "next/link";

type PageHeaderProps = { active?: "gallery" | "admin" };

export function PageHeader({ active = "gallery" }: PageHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner page-wrap">
        <Link aria-label="No. 7 Archive — về thư viện ảnh" className="wordmark" href="/gallery">
          <span className="wordmark__mark" aria-hidden="true">7</span>
          <span className="wordmark__copy">
            <span className="wordmark__name">THE NO. 7</span>
            <span className="wordmark__sub">ARCHIVE</span>
          </span>
        </Link>
        <nav aria-label="Điều hướng chính" className="site-nav">
          <Link className={`site-nav__link${active === "gallery" ? " is-active" : ""}`} href="/gallery" aria-current={active === "gallery" ? "page" : undefined}>
            Thư viện
          </Link>
          <Link className={`site-nav__admin${active === "admin" ? " is-active" : ""}`} href="/admin/gallery">
            <span>Quản trị</span><span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
