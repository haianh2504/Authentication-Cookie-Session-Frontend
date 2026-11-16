"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, fetchGalleryPage, type GalleryImage } from "@/lib/api";

export function GalleryClient() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialError, setInitialError] = useState(false);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (next?: string | null, append = false) => {
    if (busy.current) return;
    busy.current = true;
    setError(null);
    if (append) setLoadingMore(true);
    else setInitialLoading(true);
    try {
      const result = await fetchGalleryPage(next);
      setImages((current) => {
        const combined = append ? [...current, ...result.items] : result.items;
        return [...new Map(combined.map((image) => [image.imageId, image])).values()];
      });
      setCursor(result.pagination.nextCursor);
      setHasNextPage(result.pagination.hasNextPage);
      setInitialError(false);
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "Không thể kết nối đến thư viện lúc này.";
      setError(message);
      if (!append) setInitialError(true);
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchGalleryPage().then((result) => {
      if (!active) return;
      setImages(result.items);
      setCursor(result.pagination.nextCursor);
      setHasNextPage(result.pagination.hasNextPage);
    }).catch((cause: unknown) => {
      if (!active) return;
      setError(cause instanceof ApiError ? cause.message : "Không thể kết nối đến thư viện lúc này.");
      setInitialError(true);
    }).finally(() => {
      if (active) setInitialLoading(false);
    });
    return () => { active = false; };
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingMore && !initialLoading && !error) void loadPage(cursor, true);
  }, [cursor, error, hasNextPage, initialLoading, loadPage, loadingMore]);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasNextPage || initialLoading || loadingMore || error) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    }, { rootMargin: "280px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [error, hasNextPage, initialLoading, loadMore, loadingMore]);

  if (initialLoading) {
    return <div className="gallery-grid" aria-label="Đang tải thư viện ảnh" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => <div className="photo-skeleton" key={index}><span /><i /></div>)}
    </div>;
  }

  if (initialError) {
    return <div className="state-card state-card--error" role="alert">
      <span className="state-card__eyebrow">KẾT NỐI GIÁN ĐOẠN</span>
      <h2>Chưa thể mở thư viện</h2>
      <p>{error}</p>
      <button className="button button--dark" onClick={() => void loadPage()}>Thử lại <span aria-hidden="true">↗</span></button>
    </div>;
  }

  if (images.length === 0) {
    return <div className="empty-gallery">
      <div className="empty-gallery__badge" aria-hidden="true"><span>7</span></div>
      <span className="eyebrow">BẮT ĐẦU TỪ ĐÂY</span>
      <h2>Mọi hành trình đều bắt đầu từ một khoảnh khắc.</h2>
      <p>Thư viện sẽ xuất hiện tại đây khi những hình ảnh đầu tiên được thêm vào bộ sưu tập.</p>
    </div>;
  }

  return <>
    <ul className="gallery-grid" aria-label="Ảnh trong thư viện">
      {images.map((image, index) => <li className="gallery-grid__item" key={image.imageId}>
        <article className="photo-card">
          <div className="photo-card__frame">
            {/* The public image host is supplied by the backend and may vary by environment. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.imageURL} alt={`Ảnh số ${index + 1} trong thư viện Ronaldo`} loading="lazy" decoding="async" />
            <span className="photo-card__index">{String(index + 1).padStart(2, "0")}</span>
            <span className="photo-card__corner" aria-hidden="true">↗</span>
          </div>
          <div className="photo-card__meta"><span>THE NO. 7 ARCHIVE</span><span>CR7</span></div>
        </article>
      </li>)}
    </ul>
    {error && <p className="inline-error" role="alert">{error}</p>}
    <div className="gallery-more" ref={sentinel}>
      {loadingMore && <span className="loading-label"><i className="spinner" /> Đang tải thêm ảnh</span>}
      {error && hasNextPage && <button className="button button--outline" onClick={loadMore}>Thử tải lại</button>}
      {!loadingMore && !error && hasNextPage && <button className="button button--outline" onClick={loadMore}>Tải thêm ảnh <span aria-hidden="true">↓</span></button>}
      {!hasNextPage && <span className="gallery-end">Bạn đã xem hết bộ sưu tập.</span>}
    </div>
  </>;
}
