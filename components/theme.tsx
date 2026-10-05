"use client";
import {useEffect} from "react";
import {themeSchedule} from "@/lib/theme-config";
function apply(mode:string){let theme="light";if(mode==="dark")theme="dark";else if(mode==="auto-cairo"){const hour=Number(new Intl.DateTimeFormat("en-US",{hour:"2-digit",hourCycle:"h23",timeZone:themeSchedule.cairoTimeZone}).format(new Date()));theme=hour>=themeSchedule.dayStart&&hour<themeSchedule.nightStart?"light":"dark";}else if(mode==="auto-device"){const hour=new Date().getHours();theme=hour>=themeSchedule.dayStart&&hour<themeSchedule.nightStart?"light":"dark";}document.documentElement.dataset.theme=theme;}
export function ThemeBoot(){useEffect(()=>{const mode=localStorage.getItem("theme-mode")||"auto-device";apply(mode);const on=(e:Event)=>apply((e as CustomEvent<string>).detail);window.addEventListener("theme-change",on);return()=>window.removeEventListener("theme-change",on);},[]);return null;}
