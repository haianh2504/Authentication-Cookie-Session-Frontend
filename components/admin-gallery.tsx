"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, deleteImage, fetchGalleryPage, getAdminSession, logoutAdmin, uploadImage, type GalleryImage } from "@/lib/api";

const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED = new Set(["jpg", "jpeg", "png", "heic", "heif", "webp", "avif"]);

export function AdminGallery() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [authState, setAuthState] = useState<"checking" | "ready" | "redirected" | "error">("checking");
  const [authError, setAuthError] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [logoutPending, setLogoutPending] = useState(false);

  const loadImages = useCallback(async (append = false, cursor?: string | null) => {
    setListLoading(true);
    setListError("");
    try {
      const page = await fetchGalleryPage(cursor);
      setImages((current) => {
        const combined = append ? [...current, ...page.items] : page.items;
        return [...new Map(combined.map((image) => [image.imageId, image])).values()];
      });
      setNextCursor(page.pagination.nextCursor);
      setHasNextPage(page.pagination.hasNextPage);
    } catch (cause) {
      setListError(cause instanceof ApiError ? cause.message : "Không thể tải thư viện ảnh.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminSession().then((state) => {
      if (!active) return;
      if (state.authenticated) {
        setAuthState("ready");
        void loadImages();
      }
      else {
        setAuthState("redirected");
        router.replace("/admin/login");
      }
    }).catch((cause: unknown) => {
      if (!active) return;
      if (cause instanceof ApiError && cause.status === 401) {
        setAuthState("redirected");
        router.replace("/admin/login");
      } else {
        setAuthError(cause instanceof ApiError ? cause.message : "Không thể kiểm tra phiên đăng nhập.");
        setAuthState("error");
      }
    });
    return () => { active = false; };
  }, [loadImages, router]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function chooseFile(file?: File) {
    setFileError("");
    setUploadError("");
    setUploadMessage("");
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED.has(extension)) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      setSelected(null);
      setFileError("Định dạng chưa được hỗ trợ. Hãy chọn JPG, PNG, HEIC, HEIF, WebP hoặc AVIF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      setSelected(null);
      setFileError("Ảnh vượt quá giới hạn 15 MB. Hãy chọn tệp nhỏ hơn.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setSelected(file);
    setPreview(URL.createObjectURL(file));
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.classList.remove("is-dragging");
    chooseFile(event.dataTransfer.files[0]);
  }

  async function submitUpload() {
    if (!selected) return;
    setUploading(true);
    setUploadError("");
    setUploadMessage("");
    try {
      await uploadImage(selected);
      setSelected(null);
      setPreview("");
      setUploadMessage("Ảnh đã được thêm vào thư viện.");
      await loadImages();
    } catch (cause) {
      setUploadError(cause instanceof ApiError ? cause.message : "Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(image: GalleryImage) {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này khỏi thư viện không? Thao tác này không thể hoàn tác.")) return;
    setDeleting(image.imageId);
    setListError("");
    try {
      await deleteImage(image.imageId);
      setImages((current) => current.filter((item) => item.imageId !== image.imageId));
    } catch (cause) {
      setListError(cause instanceof ApiError ? cause.message : "Không thể xóa ảnh. Vui lòng thử lại.");
    } finally {
      setDeleting(null);
    }
  }

  async function signOut() {
    setLogoutPending(true);
    try {
      await logoutAdmin();
      router.replace("/admin/login");
    } catch (cause) {
      setAuthError(cause instanceof ApiError ? cause.message : "Không thể đăng xuất. Vui lòng thử lại.");
      setLogoutPending(false);
    }
  }

  if (authState === "checking" || authState === "redirected") {
    return <div className="admin-gate" role="status"><i className="spinner" /> <span>{authState === "checking" ? "Đang kiểm tra phiên quản trị…" : "Đang chuyển đến đăng nhập…"}</span></div>;
  }
  if (authState === "error") {
    return <div className="state-card state-card--error" role="alert"><span className="state-card__eyebrow">PHIÊN QUẢN TRỊ</span><h2>Chưa thể mở khu vực quản trị</h2><p>{authError}</p><button className="button button--dark" onClick={() => window.location.reload()}>Thử lại <span aria-hidden="true">↗</span></button></div>;
  }

  return <div className="admin-dashboard">
    <section className="admin-panel upload-panel" aria-labelledby="upload-title">
      <div className="panel-heading"><div><span className="eyebrow">01 / THƯ VIỆN</span><h2 id="upload-title">Thêm khoảnh khắc</h2></div><span className="panel-heading__icon" aria-hidden="true">＋</span></div>
      <div className={`drop-zone${preview ? " has-preview" : ""}`} onDragOver={(event) => { event.preventDefault(); event.currentTarget.classList.add("is-dragging"); }} onDragLeave={(event) => event.currentTarget.classList.remove("is-dragging")} onDrop={onDrop}>
        {preview ? <div className="upload-preview">
          {/* Local object URL preview; the actual file is submitted directly to the backend. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Xem trước ảnh sắp tải lên" />
          <div className="upload-preview__caption"><span>{selected?.name}</span><button className="text-button" type="button" onClick={() => { setSelected(null); setPreview(""); }}>Bỏ ảnh</button></div>
        </div> : <div className="drop-zone__empty"><span className="upload-glyph" aria-hidden="true">↑</span><strong>Kéo ảnh vào đây</strong><span>hoặc chọn từ thiết bị của bạn</span><button className="button button--outline" type="button" onClick={() => input.current?.click()}>Chọn ảnh <span aria-hidden="true">↗</span></button><span className="file-guidance">JPG · PNG · HEIC · WEBP · AVIF <b>·</b> Tối đa 15 MB</span></div>}
        <input ref={input} type="file" accept=".jpg,.jpeg,.png,.heic,.heif,.webp,.avif,image/jpeg,image/png,image/heic,image/heif,image/webp,image/avif" className="visually-hidden" onChange={onFileChange} aria-label="Chọn ảnh để tải lên" />
      </div>
      {fileError && <p className="form-error" role="alert">{fileError}</p>}
      {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
      {uploadMessage && <p className="form-success" role="status">{uploadMessage}</p>}
      {selected && <button className="button button--red upload-submit" type="button" onClick={() => void submitUpload()} disabled={uploading}>{uploading ? <><i className="spinner spinner--light" /> Đang tải lên</> : <>Tải ảnh lên <span aria-hidden="true">↗</span></>}</button>}
      {!selected && <p className="upload-footnote">Mỗi hình ảnh góp thêm một chương cho hành trình.</p>}
    </section>

    <section className="admin-panel admin-library" aria-labelledby="admin-library-title">
      <div className="panel-heading panel-heading--library"><div><span className="eyebrow">02 / BỘ SƯU TẬP</span><h2 id="admin-library-title">Ảnh trong thư viện</h2></div><button className="button button--outline button--small" onClick={() => void loadImages()} disabled={listLoading}>{listLoading ? "Đang tải" : "Làm mới ↻"}</button></div>
      {listError && <div className="inline-error" role="alert">{listError}<button className="text-button" onClick={() => void loadImages()}>Thử lại</button></div>}
      {listLoading && images.length === 0 ? <div className="admin-empty"><i className="spinner" /><span>Đang tải thư viện…</span></div> : images.length === 0 ? <div className="admin-empty"><span className="admin-empty__mark" aria-hidden="true">7</span><strong>Chưa có ảnh nào</strong><span>Chọn một hình ảnh để bắt đầu bộ sưu tập.</span></div> : <ul className="admin-image-grid">
        {images.map((image, index) => <li className="admin-image" key={image.imageId}>
          <div className="admin-image__frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.imageURL} alt={`Ảnh ${index + 1} trong thư viện`} loading="lazy" decoding="async" />
            <span className="admin-image__number">{String(index + 1).padStart(2, "0")}</span>
            <button className="delete-button" aria-label={`Xóa ảnh số ${index + 1}`} onClick={() => void removeImage(image)} disabled={deleting === image.imageId}>{deleting === image.imageId ? <i className="spinner spinner--light" /> : "×"}</button>
          </div>
          <code>{image.imageId}</code>
        </li>)}
      </ul>}
      {hasNextPage && <div className="admin-load-more"><button className="button button--outline button--small" onClick={() => void loadImages(true, nextCursor)} disabled={listLoading}>{listLoading ? "Đang tải…" : "Tải thêm ảnh ↓"}</button></div>}
      <p className="library-footnote">Ảnh mới xuất hiện trước. Xóa ảnh sẽ gỡ tệp và bản ghi khỏi thư viện.</p>
    </section>
    <div className="admin-logout-row"><span>Đang đăng nhập với tư cách quản trị viên</span><button className="text-button text-button--logout" onClick={() => void signOut()} disabled={logoutPending}>{logoutPending ? "Đang đăng xuất…" : "Đăng xuất ↗"}</button></div>
    {authError && <p className="form-error" role="alert">{authError}</p>}
  </div>;
}
