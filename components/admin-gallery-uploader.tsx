"use client";

import { useRef, useState } from "react";

export function AdminGalleryUploader({ fieldId }: { fieldId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage("");
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.set("file", file);
      body.set("bucket", "project-images");
      body.set("folder", "projects/gallery");
      try {
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const result = await response.json() as { path?: string; error?: string };
        if (!response.ok || !result.path) throw new Error(result.error || "تعذر رفع الصورة.");
        const field = document.getElementById(fieldId) as HTMLTextAreaElement | null;
        if (field) field.value = [field.value.trim(), result.path].filter(Boolean).join("\n");
        setMessage("تم رفع الصور وإضافتها للمعرض.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "تعذر رفع الصورة.");
        break;
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return <div className="admin-uploader" tabIndex={0}
    onDragOver={(event) => event.preventDefault()}
    onDrop={(event) => { event.preventDefault(); void upload(event.dataTransfer.files); }}
    onPaste={(event) => {
      const images = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
      if (!images.length) return;
      event.preventDefault();
      const transfer = new DataTransfer();
      images.forEach((image) => transfer.items.add(image));
      void upload(transfer.files);
    }}>
    <span>ارفع صور المشروع أو اسحبها هنا. ستضاف تلقائيًا إلى قائمة المعرض.</span>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => void upload(event.target.files)} />
    <button type="button" className="admin-button" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? "جارٍ الرفع…" : "اختيار صور المعرض"}</button>
    {message && <small role="status">{message}</small>}
  </div>;
}
