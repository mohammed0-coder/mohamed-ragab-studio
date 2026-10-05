"use client";
import {useMemo,useState} from "react";
import type {Project} from "@/lib/types";
import {ProjectGrid} from "@/components/site";
import {useLanguage,T} from "@/components/language";
export function ProjectList({projects}:{projects:Project[]}){const [active,setActive]=useState<string|null>(null);const {language}=useLanguage();const categories=useMemo(()=>Array.from(new Set(projects.map(project=>project.category).filter(Boolean))),[projects]);const visible=useMemo(()=>active===null?projects:projects.filter(p=>p.category===active),[active,projects]);return <><div className="filters" role="group" aria-label={language==="ar"?"تصفية المشاريع":"Filter projects"}><button className={`filter-chip ${active===null?"active":""}`} onClick={()=>setActive(null)} aria-pressed={active===null}><T ar="الكل" en="All"/></button>{categories.map(category=><button key={category} className={`filter-chip ${active===category?"active":""}`} onClick={()=>setActive(category)} aria-pressed={active===category}><T ar={category} en={category}/></button>)}</div><ProjectGrid projects={visible}/></>}
