"use client";

import { useMemo, useState } from "react";
import type { ContactMessage, MessageGroup } from "@/lib/types";
import { Classic } from "@/components/classic-loader";

type BoundMessageAction = (messageId: string, value: string) => void | Promise<void>;
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
  { name: "Inter", css: "Inter, Arial, sans-serif" },
  { name: "Poppins", css: "Poppins, Arial, sans-serif" },
  { name: "Montserrat", css: "Montserrat, Arial, sans-serif" },
  { name: "DM Sans", css: "'DM Sans', Arial, sans-serif" },
  { name: "Manrope", css: "Manrope, Arial, sans-serif" },
  { name: "Playfair Display", css: "'Playfair Display', Georgia, serif" },
  { name: "Lora", css: "Lora, Georgia, serif" },
  { name: "Space Grotesk", css: "'Space Grotesk', Arial, sans-serif" },
  { name: "IBM Plex Sans", css: "'IBM Plex Sans', Arial, sans-serif" },
  { name: "Cairo", css: "Cairo, Arial, sans-serif" },
] as const;

const palettes = [
  { name: "Studio", accent: "#7c1e2d", background: "#f4f1ea", ink: "#191817", line: "#cfc6b8" },
  { name: "Ink", accent: "#181818", background: "#f7f7f5", ink: "#111", line: "#d4d4d0" },
  { name: "Purple", accent: "#6b4de6", background: "#f5f1ff", ink: "#241d37", line: "#d8cbff" },
  { name: "Blue", accent: "#3157a6", background: "#eef3fb", ink: "#16243c", line: "#cad5ea" },
  { name: "Lemon", accent: "#8b8f00", background: "#fbfbe9", ink: "#202000", line: "#ddddad" },
  { name: "Sand", accent: "#9b7048", background: "#f5eee4", ink: "#2c2117", line: "#dac8b4" },
  { name: "Lilac", accent: "#80668f", background: "#f4eff7", ink: "#2a2130", line: "#d9cadf" },
  { name: "Red", accent: "#a8202f", background: "#fff0f2", ink: "#321116", line: "#e9c6cc" },
] as const;

const templates = [
  { id: "minimal", name: "Minimal", eyebrow: "THANK YOU FOR REACHING OUT", accentWidth: "72px" },
  { id: "editorial", name: "Editorial", eyebrow: "MOHAMED RAGAB STUDIO / NOTE", accentWidth: "120px" },
  { id: "card", name: "Card", eyebrow: "A NOTE FROM MRS", accentWidth: "48px" },
  { id: "signature", name: "Signature", eyebrow: "WITH APPRECIATION", accentWidth: "92px" },
  { id: "split", name: "Split", eyebrow: "MRS / RESPONSE", accentWidth: "100%" },
  { id: "bold", name: "Bold", eyebrow: "NEW MESSAGE / RESPONSE", accentWidth: "100%" },
] as const;

const googleFontCss = `@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Inter:wght@400;500;600&family=Lora:wght@400;600&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600&family=Poppins:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap");`;

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] || char));
}

function textToHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function makeReplyHtml({ message, reply, font, palette, template, direction }: { message: ContactMessage; reply: string; font: typeof fonts[number]; palette: typeof palettes[number]; template: typeof templates[number]; direction: "ltr" | "rtl" }) {
  const align = direction === "rtl" ? "right" : "left";
  const intro = direction === "rtl" ? `مرحبًا ${escapeHtml(message.name)}،` : `Hi ${escapeHtml(message.name)},`;
  const thankYou = direction === "rtl" ? "شكرًا لتواصلك مع Mohamed Ragab Studio." : "Thank you for reaching out to Mohamed Ragab Studio.";
  const safeReply = textToHtml(reply || "");
  const logo = `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/brand/MRS_Black_Horizontal.png`;
  const logoHtml = logo.startsWith("http") ? `<img src="${logo}" width="220" alt="Mohamed Ragab Studio" style="display:block;width:220px;max-width:100%;height:auto;border:0;">` : `<strong style="font-size:18px;letter-spacing:.02em;">Mohamed Ragab Studio</strong>`;
  const radius = template.id === "bold" ? "0" : template.id === "card" ? "18px" : "8px";
  const border = template.id === "minimal" ? "none" : `1px solid ${palette.line}`;
  const heading = template.id === "split" ? `<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${palette.accent};font-weight:700;margin-bottom:18px;">${template.eyebrow}</div>` : `<div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${palette.accent};font-weight:700;margin-bottom:18px;">${template.eyebrow}</div>`;
  return `<!doctype html><html><body style="margin:0;padding:0;background:${palette.background};font-family:${font.css};color:${palette.ink};"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${palette.background};"><tr><td align="center" style="padding:36px 14px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;border:${border};border-radius:${radius};overflow:hidden;background:#ffffff;"><tr><td style="padding:34px 38px 14px;text-align:${align};">${logoHtml}</td></tr><tr><td style="padding:18px 38px 34px;text-align:${align};">${heading}<div style="height:4px;width:${template.accentWidth};background:${palette.accent};margin:0 0 28px;max-width:100%;"></div><p style="margin:0 0 14px;font-size:16px;line-height:1.8;font-weight:600;">${intro}</p><p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:${palette.ink};">${thankYou}</p><div style="font-size:15px;line-height:2;white-space:normal;">${safeReply}</div></td></tr><tr><td style="padding:18px 38px 28px;border-top:1px solid ${palette.line};text-align:${align};"><p style="margin:0;font-size:12px;line-height:1.8;color:#666;">Mohamed Ragab Studio · Design / Digital / Creative</p><div style="display:inline-block;margin-top:14px;padding:7px 12px;border:1px solid ${palette.accent};color:${palette.accent};font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">MRS / STUDIO NOTE</div></td></tr></table></td></tr></table></body></html>`;
}

export function AdminMessageCenter({ messages, groups, memberships, createGroup, deleteGroup, addToGroup, removeFromGroup, updateMessage, deleteMessage, initialMessageId }: Props) {
  const [selectedId, setSelectedId] = useState(initialMessageId || messages[0]?.id || "");
  const [activeGroupId, setActiveGroupId] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [fontName, setFontName] = useState<string>(fonts[0].name);
  const [paletteName, setPaletteName] = useState<string>(palettes[0].name);
  const [templateId, setTemplateId] = useState<string>(templates[0].id);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [copyState, setCopyState] = useState<"idle" | "busy" | "done">("idle");

  const filtered = useMemo(() => activeGroupId === "all" ? messages : messages.filter((message) => memberships.some((item) => item.message_id === message.id && item.group_id === activeGroupId)), [activeGroupId, memberships, messages]);
  const selected = messages.find((message) => message.id === selectedId) || filtered[0] || messages[0];
  const selectedGroups = selected ? groups.filter((group) => memberships.some((item) => item.message_id === selected.id && item.group_id === group.id)) : [];
  const availableGroups = selected ? groups.filter((group) => !selectedGroups.some((item) => item.id === group.id)) : groups;
  const font = fonts.find((item) => item.name === fontName) || fonts[0];
  const palette = palettes.find((item) => item.name === paletteName) || palettes[0];
  const template = templates.find((item) => item.id === templateId) || templates[0];
  const previewHtml = selected ? makeReplyHtml({ message: selected, reply, font, palette, template, direction }) : "";
  const plainReply = selected ? `${direction === "rtl" ? `مرحبًا ${selected.name}،` : `Hi ${selected.name},`}\n\n${direction === "rtl" ? "شكرًا لتواصلك مع Mohamed Ragab Studio." : "Thank you for reaching out to Mohamed Ragab Studio."}\n\n${reply}\n\nMohamed Ragab Studio` : "";

  async function copyFormatted() {
    if (!previewHtml) return;
    setCopyState("busy");
    try {
      if ("clipboard" in navigator && "ClipboardItem" in window) {
        const item = new ClipboardItem({ "text/html": new Blob([previewHtml], { type: "text/html" }), "text/plain": new Blob([plainReply], { type: "text/plain" }) });
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
    if (selected) window.location.href = `mailto:${selected.email}?subject=${encodeURIComponent("رد على رسالتك — Mohamed Ragab Studio")}`;
  }

  if (!messages.length) return <div className="admin-empty">لا توجد رسائل محفوظة حتى الآن.</div>;

  return (
    <div className="message-center">
      <style>{googleFontCss}</style>
      <div className="message-center-toolbar">
        <div className="message-group-chips">
          <button type="button" className={`filter-chip ${activeGroupId === "all" ? "active" : ""}`} onClick={() => setActiveGroupId("all")}>الكل <small>{messages.length}</small></button>
          {groups.map((group) => <span className="message-group-pill-wrap" key={group.id}><button type="button" className={`filter-chip ${activeGroupId === group.id ? "active" : ""}`} onClick={() => setActiveGroupId(group.id)}><i style={{ background: group.color }} />{group.name}</button><form action={deleteGroup.bind(null, group.id)}><button type="submit" className="message-group-delete" aria-label={`حذف مجموعة ${group.name}`}>×</button></form></span>)}
        </div>
        <form action={createGroup} className="message-group-create"><input name="name" required maxLength={80} placeholder="اسم مجموعة جديدة" aria-label="اسم مجموعة جديدة" /><input name="color" type="color" defaultValue="#7c1e2d" title="لون المجموعة" /><button className="admin-button admin-secondary" type="submit">+ مجموعة</button></form>
      </div>

      <div className="message-center-grid">
        <div className="message-center-list">
          {filtered.map((message) => <button type="button" key={message.id} className={`message-list-item ${selected?.id === message.id ? "is-active" : ""} ${message.status === "new" ? "is-new" : ""}`} onClick={() => { setSelectedId(message.id); setComposerOpen(false); }}><span className="message-list-main"><strong>{message.name}</strong><small>{message.email}</small><p>{message.message}</p></span><span className="message-list-side"><small>{new Date(message.created_at).toLocaleDateString("ar-EG")}</small><b>{message.status}</b></span></button>)}
          {!filtered.length && <div className="admin-empty">لا توجد رسائل داخل هذه المجموعة.</div>}
        </div>

        {selected && <div className="message-center-detail">
          <div className="message-detail-head"><div><span className="eyebrow">INBOX / MESSAGE</span><h3>{selected.name}</h3><p>{selected.email}</p></div><span className={`admin-status status-${selected.status}`}>{selected.status}</span></div>
          <div className="message-detail-body"><div className="message-original"><span className="eyebrow">رسالة العميل</span><p>{selected.message}</p><div className="admin-message-meta">{selected.phone || "بدون هاتف"} · {selected.company || "بدون شركة"} · {selected.project_type || "بدون نوع خدمة"}</div></div>
            <div className="message-tags"><span className="eyebrow">المجموعات</span><div>{selectedGroups.map((group) => <span className="message-tag" key={group.id} style={{ borderColor: group.color }}><i style={{ background: group.color }} />{group.name}<form action={removeFromGroup.bind(null, selected.id, group.id)}><button type="submit" aria-label={`إزالة ${group.name}`}>×</button></form></span>)}</div></div>
            {availableGroups.length > 0 && <div className="message-add-group"><span className="eyebrow">إضافة إلى مجموعة</span><div>{availableGroups.map((group) => <form action={addToGroup.bind(null, selected.id, group.id)} key={group.id}><button type="submit" className="group-add-button"><i style={{ background: group.color }} />{group.name}</button></form>)}</div></div>}
          </div>
          <div className="message-detail-actions"><button className="admin-button" type="button" onClick={() => setComposerOpen(true)}>صمّم الرد ↗</button>{selected.status !== "read" && <form action={updateMessage.bind(null, selected.id, "read")}><button className="admin-button admin-secondary" type="submit">تمت القراءة</button></form>}{selected.status !== "archived" && <form action={updateMessage.bind(null, selected.id, "archived")}><button className="admin-button admin-secondary" type="submit">أرشفة</button></form>}{groups.length > 0 && groups.length < 2 && null}<AdminDeleteButtonButton action={deleteMessage.bind(null, selected.id)} /></div>
        </div>}
      </div>

      {composerOpen && selected && <div className="reply-designer-overlay" role="dialog" aria-modal="true" aria-label="مصمم الرد" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposerOpen(false); }}>
        <div className="reply-designer-modal">
          <div className="reply-designer-top"><div><span className="eyebrow">REPLY STUDIO</span><h3>صمّم الرد على {selected.name}</h3></div><button type="button" className="modal-close" onClick={() => setComposerOpen(false)} aria-label="إغلاق">×</button></div>
          <div className="reply-designer-grid">
            <div className="reply-controls">
              <label><span>الخط</span><select value={fontName} onChange={(event) => setFontName(event.target.value)}>{fonts.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
              <label><span>القالب</span><select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>{templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span>اللون</span><select value={paletteName} onChange={(event) => setPaletteName(event.target.value)}>{palettes.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
              <label><span>اتجاه النص</span><select value={direction} onChange={(event) => setDirection(event.target.value as "ltr" | "rtl")}><option value="ltr">Left → Right</option><option value="rtl">Right → Left</option></select></label>
              <label className="reply-textarea-label"><span>نص الرد</span><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={10} placeholder={direction === "rtl" ? "اكتب رسالتك هنا…" : "Write your reply here…"} dir={direction} /></label>
              <p className="reply-helper">المعاينة تستخدم الخط المختار. بعض خدمات البريد قد تستبدل الخط بخط بديل إذا لم تدعمه.</p>
              <div className="reply-action-row"><button type="button" className="admin-button" disabled={!reply.trim() || copyState === "busy"} onClick={() => void copyFormatted()}>{copyState === "busy" ? <Classic className="size-4" /> : copyState === "done" ? "تم النسخ ✓" : "نسخ الرسالة المنسقة"}</button><button type="button" className="admin-button admin-secondary" disabled={!reply.trim() || copyState === "busy"} onClick={() => void copyAndOpenEmail()}>نسخ ثم فتح البريد ↗</button></div>
            </div>
            <div className={`reply-preview-shell direction-${direction}`}>
              <div className="reply-preview-label">LIVE PREVIEW</div>
              <div className="reply-preview" dir={direction} style={{ fontFamily: font.css, background: palette.background, color: palette.ink }} dangerouslySetInnerHTML={{ __html: previewHtml.replace(/^<!doctype html><html><body[^>]*>|<\/body><\/html>$/gi, "") }} />
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

function AdminDeleteButtonButton({ action }: { action: () => void | Promise<void> }) {
  return <form action={action}><button className="admin-button admin-danger" type="submit">حذف الرسالة</button></form>;
}
