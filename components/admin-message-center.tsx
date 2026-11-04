"use client";
import { useMemo, useState } from "react";
import type { ContactMessage, MessageGroup } from "@/lib/types";
import { Classic } from "@/components/classic-loader";
type BoundMessageAction = (
  messageId: string,
  value: string,
) => void | Promise<void>;
type SimpleAction = (formData: FormData) => void | Promise<void>;
type Props = {
  messages: ContactMessage[];
  groups: MessageGroup[];
  memberships: { message_id: string; group_id: string }[];
  createGroup: SimpleAction;
  deleteGroup: (groupId: string) => void | Promise<void>;
  addToGroup: BoundMessageAction;
  removeFromGroup: BoundMessageAction;
  updateMessage: BoundMessageAction;
  deleteMessage: (messageId: string) => void | Promise<void>;
  initialMessageId?: string;
};
const fonts = [
  { name: "Inter", css: "Inter,Arial,sans-serif" },
  { name: "Poppins", css: "Poppins,Arial,sans-serif" },
  { name: "Montserrat", css: "Montserrat,Arial,sans-serif" },
  { name: "DM Sans", css: "'DM Sans',Arial,sans-serif" },
  { name: "Manrope", css: "Manrope,Arial,sans-serif" },
  { name: "Playfair Display", css: "'Playfair Display',Georgia,serif" },
  { name: "Lora", css: "Lora,Georgia,serif" },
  { name: "Space Grotesk", css: "'Space Grotesk',Arial,sans-serif" },
  { name: "IBM Plex Sans", css: "'IBM Plex Sans',Arial,sans-serif" },
  { name: "Cairo", css: "Cairo,Arial,sans-serif" },
] as const;
const palettes = [
  {
    name: "Studio",
    accent: "#8d2b40",
    background: "#f4f1ea",
    ink: "#191817",
    line: "#cfc6b8",
  },
  {
    name: "Ink",
    accent: "#181818",
    background: "#f7f7f5",
    ink: "#111",
    line: "#d4d4d0",
  },
  {
    name: "Purple",
    accent: "#6b4de6",
    background: "#f5f1ff",
    ink: "#241d37",
    line: "#d8cbff",
  },
  {
    name: "Blue",
    accent: "#3157a6",
    background: "#eef3fb",
    ink: "#16243c",
    line: "#cad5ea",
  },
  {
    name: "Lemon",
    accent: "#8b8f00",
    background: "#fbfbe9",
    ink: "#202000",
    line: "#ddddad",
  },
  {
    name: "Sand",
    accent: "#9b7048",
    background: "#f5eee4",
    ink: "#2c2117",
    line: "#dac8b4",
  },
  {
    name: "Lilac",
    accent: "#80668f",
    background: "#f4eff7",
    ink: "#2a2130",
    line: "#d9cadf",
  },
  {
    name: "Red",
    accent: "#a8202f",
    background: "#fff0f2",
    ink: "#321116",
    line: "#e9c6cc",
  },
] as const;
const templates = [
  { id: "minimal", name: "Minimal", eyebrow: "THANK YOU FOR REACHING OUT" },
  {
    id: "editorial",
    name: "Editorial",
    eyebrow: "MOHAMED RAGAB STUDIO / NOTE",
  },
  { id: "card", name: "Card", eyebrow: "A NOTE FROM MRS" },
  { id: "signature", name: "Signature", eyebrow: "WITH APPRECIATION" },
  { id: "split", name: "Split", eyebrow: "MRS / RESPONSE" },
  { id: "bold", name: "Bold", eyebrow: "NEW MESSAGE / RESPONSE" },
  { id: "frame", name: "Frame", eyebrow: "MRS / LETTER" },
  { id: "poster", name: "Poster", eyebrow: "CREATIVE NOTE" },
] as const;
const googleFontCss = `@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Inter:wght@400;500;600&family=Lora:wght@400;600&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600&family=Poppins:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap");`;
function esc(v: string) {
  return v.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c,
  );
}
function textHtml(v: string) {
  return esc(v).replace(/\n/g, "<br>");
}
function makeReplyHtml({
  message,
  reply,
  font,
  palette,
  template,
  direction,
  bgColor,
  textColor,
  accentColor,
}: {
  message: ContactMessage;
  reply: string;
  font: (typeof fonts)[number];
  palette: (typeof palettes)[number];
  template: (typeof templates)[number];
  direction: "ltr" | "rtl";
  bgColor: string;
  textColor: string;
  accentColor: string;
}) {
  const align = direction === "rtl" ? "right" : "left";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://mohamed-ragab-studio.vercel.app";
  const logo = `${origin}/brand/MRS_Full_Color_Horizontal.png`;
  const stamp = `${origin}/brand/MRS_Full_Color_Vertical.png`;
  const intro =
    direction === "rtl"
      ? `مرحبًا ${esc(message.name)}،`
      : `Hi ${esc(message.name)},`;
  const thank =
    direction === "rtl"
      ? "شكرًا لتواصلك مع Mohamed Ragab Studio."
      : "Thank you for reaching out to Mohamed Ragab Studio.";
  const body = textHtml(reply || "");
  const radius =
    template.id === "card"
      ? "24px"
      : template.id === "poster"
        ? "0"
        : template.id === "bold"
          ? "0"
          : "12px";
  const shadow =
    template.id === "card" ? "box-shadow:0 20px 55px rgba(0,0,0,.10);" : "";
  const border =
    template.id === "minimal" ? "none" : `1px solid ${palette.line}`;
  const outer = template.id === "bold" ? accentColor : bgColor;
  const headerBg =
    template.id === "split"
      ? textColor
      : template.id === "poster"
        ? accentColor
        : "#ffffff";
  const headerColor =
    template.id === "split" || template.id === "poster" ? "#ffffff" : textColor;
  const stampSize = template.id === "poster" ? "76" : "58";
  const heading = `<div style="font-size:${template.id === "poster" ? "14" : "10"}px;letter-spacing:.16em;text-transform:uppercase;color:${headerColor};font-weight:700;margin-bottom:16px;">${template.eyebrow}</div>`;
  return `<!doctype html><html><body style="margin:0;padding:0;background:${outer};font-family:${font.css};color:${textColor};"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${outer};"><tr><td align="center" style="padding:38px 14px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:700px;border:${border};border-radius:${radius};overflow:hidden;background:${bgColor};${shadow}"><tr><td style="padding:26px 34px 22px;background:${headerBg};text-align:${align};"><img src="${logo}" width="210" alt="Mohamed Ragab Studio" style="display:block;width:210px;max-width:100%;height:auto;border:0;">${heading}</td></tr><tr><td style="padding:30px 34px 38px;background:${bgColor};text-align:${align};direction:${direction};"><div style="height:4px;width:${template.id === "poster" ? "100%" : "96px"};background:${accentColor};margin-bottom:26px;"></div><p style="margin:0 0 14px;font-size:17px;line-height:1.8;font-weight:700;color:${textColor};">${intro}</p><p style="margin:0 0 18px;font-size:14px;line-height:1.9;color:${textColor};opacity:.78;">${thank}</p><div style="font-size:15px;line-height:2.05;color:${textColor};">${body}</div></td></tr><tr><td style="padding:18px 34px 28px;border-top:1px solid ${palette.line};background:${bgColor};text-align:${align};"><img src="${stamp}" width="${stampSize}" height="${stampSize}" alt="Mohamed Ragab Studio" style="display:block;width:${stampSize}px;height:${stampSize}px;object-fit:contain;${direction === "rtl" ? "margin-left:0;margin-right:auto;" : "margin-left:auto;margin-right:0;"}"><p style="margin:10px 0 0;font-size:11px;line-height:1.8;color:#777;">Mohamed Ragab Studio · Design / Digital / Creative</p></td></tr></table></td></tr></table></body></html>`;
}
export function AdminMessageCenter({
  messages,
  groups,
  memberships,
  createGroup,
  deleteGroup,
  addToGroup,
  removeFromGroup,
  updateMessage,
  deleteMessage,
  initialMessageId,
}: Props) {
  const [selectedId, setSelectedId] = useState(
    initialMessageId || messages[0]?.id || "",
  );
  const [activeGroupId, setActiveGroupId] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [fontName, setFontName] = useState<string>(fonts[0].name);
  const [paletteName, setPaletteName] = useState<string>(palettes[0].name);
  const [templateId, setTemplateId] = useState<string>(templates[0].id);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [bgColor, setBgColor] = useState<string>(palettes[0].background);
  const [textColor, setTextColor] = useState<string>(palettes[0].ink);
  const [accentColor, setAccentColor] = useState<string>(palettes[0].accent);
  const [copyState, setCopyState] = useState<"idle" | "busy" | "done">("idle");
  const filtered = useMemo(
    () =>
      activeGroupId === "all"
        ? messages
        : messages.filter((m) =>
            memberships.some(
              (x) => x.message_id === m.id && x.group_id === activeGroupId,
            ),
          ),
    [activeGroupId, memberships, messages],
  );
  const selected =
    messages.find((m) => m.id === selectedId) || filtered[0] || messages[0];
  const selectedGroups = selected
    ? groups.filter((g) =>
        memberships.some(
          (x) => x.message_id === selected.id && x.group_id === g.id,
        ),
      )
    : [];
  const availableGroups = selected
    ? groups.filter((g) => !selectedGroups.some((x) => x.id === g.id))
    : groups;
  const font = fonts.find((x) => x.name === fontName) || fonts[0];
  const palette = palettes.find((x) => x.name === paletteName) || palettes[0];
  const template = templates.find((x) => x.id === templateId) || templates[0];
  const previewHtml = selected
    ? makeReplyHtml({
        message: selected,
        reply,
        font,
        palette,
        template,
        direction,
        bgColor,
        textColor,
        accentColor,
      })
    : "";
  const plainReply = selected
    ? `${direction === "rtl" ? `مرحبًا ${selected.name}،` : `Hi ${selected.name},`}\n\n${direction === "rtl" ? "شكرًا لتواصلك مع Mohamed Ragab Studio." : "Thank you for reaching out to Mohamed Ragab Studio."}\n\n${reply}\n\nMohamed Ragab Studio`
    : "";
  function applyPalette(name: string) {
    const next = palettes.find((x) => x.name === name) || palettes[0];
    setPaletteName(name);
    setBgColor(next.background);
    setTextColor(next.ink);
    setAccentColor(next.accent);
  }
  async function copyFormatted() {
    if (!previewHtml) return;
    setCopyState("busy");
    try {
      if ("clipboard" in navigator && "ClipboardItem" in window) {
        const item = new ClipboardItem({
          "text/html": new Blob([previewHtml], { type: "text/html" }),
          "text/plain": new Blob([plainReply], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else await navigator.clipboard.writeText(plainReply);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("idle");
    }
  }
  async function copyAndOpenEmail() {
    await copyFormatted();
    if (selected)
      window.location.href = `mailto:${selected.email}?subject=${encodeURIComponent("رد على رسالتك — Mohamed Ragab Studio")}`;
  }
  if (!messages.length)
    return <div className="admin-empty">لا توجد رسائل محفوظة حتى الآن.</div>;
  return (
    <div className="message-center">
      <style>{googleFontCss}</style>
      <div className="message-center-toolbar">
        <div className="message-group-chips">
          <button
            type="button"
            className={`filter-chip ${activeGroupId === "all" ? "active" : ""}`}
            onClick={() => setActiveGroupId("all")}
          >
            الكل <small>{messages.length}</small>
          </button>
          {groups.map((g) => (
            <span className="message-group-pill-wrap" key={g.id}>
              <button
                type="button"
                className={`filter-chip ${activeGroupId === g.id ? "active" : ""}`}
                onClick={() => setActiveGroupId(g.id)}
              >
                <i style={{ background: g.color }} />
                {g.name}
              </button>
              <form action={deleteGroup.bind(null, g.id)}>
                <button
                  type="submit"
                  className="message-group-delete"
                  aria-label={`حذف مجموعة ${g.name}`}
                >
                  ×
                </button>
              </form>
            </span>
          ))}
        </div>
        <form action={createGroup} className="message-group-create">
          <input
            name="name"
            required
            maxLength={80}
            placeholder="اسم مجموعة جديدة"
          />
          <input name="color" type="color" defaultValue="#8d2b40" />
          <button className="admin-button admin-secondary" type="submit">
            + مجموعة
          </button>
        </form>
      </div>
      <div className="message-center-grid">
        <div className="message-center-list">
          {filtered.map((m) => (
            <button
              type="button"
              key={m.id}
              className={`message-list-item ${selected?.id === m.id ? "is-active" : ""} ${m.status === "new" ? "is-new" : ""}`}
              onClick={() => {
                setSelectedId(m.id);
                setComposerOpen(false);
              }}
            >
              <span className="message-list-main">
                <strong>{m.name}</strong>
                <small>{m.email}</small>
                <p>{m.message}</p>
              </span>
              <span className="message-list-side">
                <small>
                  {new Date(m.created_at).toLocaleDateString("ar-EG")}
                </small>
                <b>{m.status}</b>
              </span>
            </button>
          ))}
          {!filtered.length && (
            <div className="admin-empty">لا توجد رسائل داخل هذه المجموعة.</div>
          )}
        </div>
        {selected && (
          <div className="message-center-detail">
            <div className="message-detail-head">
              <div>
                <span className="eyebrow">INBOX / MESSAGE</span>
                <h3>{selected.name}</h3>
                <p>{selected.email}</p>
              </div>
              <span className={`admin-status status-${selected.status}`}>
                {selected.status}
              </span>
            </div>
            <div className="message-detail-body">
              <div className="message-original">
                <span className="eyebrow">رسالة العميل</span>
                <p>{selected.message}</p>
                <div className="admin-message-meta">
                  {selected.phone || "بدون هاتف"} ·{" "}
                  {selected.company || "بدون شركة"} ·{" "}
                  {selected.project_type || "بدون نوع خدمة"}
                </div>
              </div>
              <div className="message-tags">
                <span className="eyebrow">المجموعات</span>
                <div>
                  {selectedGroups.map((g) => (
                    <span
                      className="message-tag"
                      key={g.id}
                      style={{ borderColor: g.color }}
                    >
                      <i style={{ background: g.color }} />
                      {g.name}
                      <form
                        action={removeFromGroup.bind(null, selected.id, g.id)}
                      >
                        <button type="submit" aria-label={`إزالة ${g.name}`}>
                          ×
                        </button>
                      </form>
                    </span>
                  ))}
                </div>
              </div>
              {availableGroups.length > 0 && (
                <div className="message-add-group">
                  <span className="eyebrow">إضافة إلى مجموعة</span>
                  <div>
                    {availableGroups.map((g) => (
                      <form
                        action={addToGroup.bind(null, selected.id, g.id)}
                        key={g.id}
                      >
                        <button type="submit" className="group-add-button">
                          <i style={{ background: g.color }} />
                          {g.name}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="message-detail-actions">
              <button
                className="admin-button"
                type="button"
                onClick={() => setComposerOpen(true)}
              >
                صمّم الرد ↗
              </button>
              {selected.status !== "read" && (
                <form action={updateMessage.bind(null, selected.id, "read")}>
                  <button
                    className="admin-button admin-secondary"
                    type="submit"
                  >
                    تمت القراءة
                  </button>
                </form>
              )}
              {selected.status !== "archived" && (
                <form
                  action={updateMessage.bind(null, selected.id, "archived")}
                >
                  <button
                    className="admin-button admin-secondary"
                    type="submit"
                  >
                    أرشفة
                  </button>
                </form>
              )}
              <AdminDeleteButtonButton
                action={deleteMessage.bind(null, selected.id)}
              />
            </div>
          </div>
        )}
      </div>
      {composerOpen && selected && (
        <div
          className="reply-designer-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setComposerOpen(false);
          }}
        >
          <div className="reply-designer-modal">
            <div className="reply-designer-top">
              <div>
                <span className="eyebrow">REPLY STUDIO</span>
                <h3>صمّم الرد على {selected.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setComposerOpen(false)}
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>
            <div className="reply-designer-grid">
              <div className="reply-controls">
                <label>
                  <span>الخط</span>
                  <select
                    value={fontName}
                    onChange={(e) => setFontName(e.target.value)}
                  >
                    {fonts.map((f) => (
                      <option key={f.name}>{f.name}</option>
                    ))}
                  </select>
                  <small
                    className="font-preview"
                    style={{ fontFamily: font.css }}
                  >
                    Aa / محمد رجب
                  </small>
                </label>
                <label>
                  <span>القالب</span>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>لوحة الألوان</span>
                  <select
                    value={paletteName}
                    onChange={(e) => applyPalette(e.target.value)}
                  >
                    {palettes.map((p) => (
                      <option key={p.name}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <div className="reply-color-grid">
                  <label>
                    <span>خلفية الرسالة</span>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>لون النص</span>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>لون التفاصيل</span>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  <span>اتجاه النص</span>
                  <select
                    value={direction}
                    onChange={(e) =>
                      setDirection(e.target.value as "ltr" | "rtl")
                    }
                  >
                    <option value="ltr">Left → Right</option>
                    <option value="rtl">Right → Left</option>
                  </select>
                </label>
                <label className="reply-textarea-label">
                  <span>نص الرد</span>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={10}
                    placeholder={
                      direction === "rtl"
                        ? "اكتب رسالتك هنا…"
                        : "Write your reply here…"
                    }
                    dir={direction}
                  />
                </label>
                <p className="reply-helper">
                  الشعار الملون والختم يستخدمان ملفات هوية الاستوديو، والقالب
                  ينسخ Rich HTML + نص عادي.
                </p>
                <div className="reply-action-row">
                  <button
                    type="button"
                    className="admin-button"
                    disabled={!reply.trim() || copyState === "busy"}
                    onClick={() => void copyFormatted()}
                  >
                    {copyState === "busy" ? (
                      <Classic className="size-4" />
                    ) : copyState === "done" ? (
                      "تم النسخ ✓"
                    ) : (
                      "نسخ الرسالة المنسقة"
                    )}
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-secondary"
                    disabled={!reply.trim() || copyState === "busy"}
                    onClick={() => void copyAndOpenEmail()}
                  >
                    نسخ ثم فتح البريد ↗
                  </button>
                </div>
              </div>
              <div className="reply-preview-shell">
                <div className="reply-preview-label">LIVE PREVIEW</div>
                <div
                  className="reply-preview"
                  dir={direction}
                  style={{
                    fontFamily: font.css,
                    background: bgColor,
                    color: textColor,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: previewHtml.replace(
                      /^<!doctype html><html><body[^>]*>|<\/body><\/html>$/gi,
                      "",
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function AdminDeleteButtonButton({
  action,
}: {
  action: () => void | Promise<void>;
}) {
  return (
    <form action={action}>
      <button className="admin-button admin-danger" type="submit">
        حذف الرسالة
      </button>
    </form>
  );
}
