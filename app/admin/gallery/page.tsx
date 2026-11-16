import { PageHeader } from "@/components/page-header";
import { AdminGallery } from "@/components/admin-gallery";

export const metadata = { title: "Quản lý thư viện | The No. 7 Archive" };

export default function AdminGalleryPage() {
  return <div className="site-shell site-shell--admin">
    <PageHeader active="admin" />
    <main className="page-wrap admin-main">
      <section className="admin-intro" aria-labelledby="admin-title">
        <div><span className="eyebrow"><i className="eyebrow__dot" /> CONTROL ROOM <span className="eyebrow__year">· PRIVATE ACCESS</span></span><h1 id="admin-title">Quản lý <em>bộ sưu tập.</em></h1><p>Thêm những khoảnh khắc mới. Gìn giữ những dấu ấn đã có.</p></div>
        <div className="admin-intro__stamp" aria-hidden="true"><span>CR7</span><i>ARCHIVE<br />MANAGER</i></div>
      </section>
      <AdminGallery />
    </main>
    <footer className="login-footer page-wrap"><span>THE NO. 7 ARCHIVE · ADMINISTRATION</span><span>PRIVATE COLLECTION / 2026</span></footer>
  </div>;
}
