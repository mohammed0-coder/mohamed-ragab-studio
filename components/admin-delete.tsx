"use client";
export function AdminDeleteButton({action,label="حذف"}:{action:(data:FormData)=>void|Promise<void>;label?:string}){return <button formAction={action} className="admin-button danger" onClick={e=>{if(!window.confirm("هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء."))e.preventDefault();}}>{label}</button>}
