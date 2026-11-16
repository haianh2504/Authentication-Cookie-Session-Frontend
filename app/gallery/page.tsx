import { PageFooter } from "@/components/page-footer";
import { PageHeader } from "@/components/page-header";
import { GalleryClient } from "@/components/gallery-client";

export const metadata = { title: "Thư viện | The No. 7 Archive" };

export default function GalleryPage() {
  return <div className="site-shell">
    <PageHeader />
    <main className="page-wrap page-main">
      <section className="archive-hero" aria-labelledby="gallery-title">
        <div className="archive-hero__copy">
          <span className="eyebrow"><i className="eyebrow__dot" /> THE NO. 7 ARCHIVE <span className="eyebrow__year">· PHOTO COLLECTION</span></span>
          <h1 id="gallery-title">Một hành trình.<br /><em>Vô vàn khoảnh khắc.</em></h1>
          <p>Những dấu ấn của Cristiano Ronaldo, được kể lại qua từng khung hình.</p>
          <a className="hero-link" href="#photo-collection">Khám phá bộ sưu tập <span aria-hidden="true">↓</span></a>
        </div>
        <div className="archive-hero__art" aria-hidden="true">
          <div className="hero-art__rings" />
          <span className="hero-art__seven">7</span>
          <span className="hero-art__label">MADE<br />OF<br />MOMENTS</span>
          <span className="hero-art__star">✳</span>
          <span className="hero-art__caption">EST. 2002&nbsp; · &nbsp;ONE OF ONE</span>
        </div>
        <span className="hero-index" aria-hidden="true">01 — 07</span>
      </section>
      <section className="collection-section" id="photo-collection" aria-labelledby="collection-title">
        <div className="section-heading">
          <div><span className="eyebrow">THE COLLECTION</span><h2 id="collection-title">Thư viện ảnh <sup>CR7</sup></h2></div>
          <p>Những khoảnh khắc mới nhất<br className="desktop-break" /> luôn được đặt lên trước.</p>
        </div>
        <GalleryClient />
      </section>
    </main>
    <PageFooter />
  </div>;
}
