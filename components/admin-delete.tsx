"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type Props = {
  action: (data: FormData) => void | Promise<void>;
  label?: string;
  message?: string;
};

export function AdminDeleteButton({
  action,
  label = "حذف",
  message = "هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه.",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dialog = open ? (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <div className="admin-dialog" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(event) => event.stopPropagation()}>
        <div className="eyebrow">تأكيد الإجراء</div>
        <h3>{message}</h3>
        <div className="admin-dialog-actions">
          <button type="button" className="admin-button admin-secondary" onClick={() => setOpen(false)}>إلغاء</button>
          <form action={async (data) => { await action(data); setOpen(false); }}>
            <button className="admin-button admin-danger" type="submit">نعم، احذف</button>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return <>
    <button type="button" className="admin-button admin-danger" onClick={() => setOpen(true)}>{label}</button>
    {mounted && dialog ? createPortal(dialog, document.body) : null}
  </>;
}
