"use client";

import {useEffect} from "react";

const spinnerHtml=`<span class="admin-button-loading"><span class="admin-classic-loader" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--loader-index:${i}"></i>`).join("")}</span><span>جارٍ التنفيذ…</span></span>`;

export function AdminPendingProgress(){useEffect(()=>{const onSubmit=(event:Event)=>{const form=event.target as HTMLFormElement|null;if(!form)return;const submitter=(event as SubmitEvent).submitter as HTMLButtonElement|null;if(!submitter||submitter.type!=="submit")return;if(submitter.dataset.loading==="true"){event.preventDefault();return;}submitter.dataset.loading="true";submitter.setAttribute("aria-busy","true");submitter.innerHTML=spinnerHtml;};document.addEventListener("submit",onSubmit,true);return()=>document.removeEventListener("submit",onSubmit,true)},[]);return null}
