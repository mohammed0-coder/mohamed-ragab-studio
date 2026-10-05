import type { Client, Project, Service } from "@/lib/types";

// Temporary portfolio entries keep the design presentable before the owner adds real content.
export const seedProjects: Project[] = [
  { id:"seed-01", slug:"nawa", title:"نَوى", client_name:"علامة تجريبية", short_description:"هوية تنمو من الفكرة إلى السوق.", category:"هوية بصرية", services:["استراتيجية","هوية بصرية"], featured:true, homepage_featured:true, published:true, sort_order:1 },
  { id:"seed-02", slug:"madar", title:"مدار", client_name:"مشروع تجريبي", short_description:"حضور رقمي يتحرك بإيقاع جديد.", category:"تجارب رقمية", services:["تجربة رقمية","تطوير ويب"], featured:true, homepage_featured:true, published:true, sort_order:2 },
  { id:"seed-03", slug:"sifr", title:"صِفر", client_name:"علامة تجريبية", short_description:"لغة بصرية لمنتج يومي مختلف.", category:"حملات إعلانية", services:["إبداع","إنتاج"], featured:true, homepage_featured:true, published:true, sort_order:3 },
  { id:"seed-04", slug:"bayt", title:"بيت الحكاية", client_name:"مشروع تجريبي", short_description:"حكاية محلية بصوت معاصر.", category:"محتوى وفيديو", services:["استراتيجية محتوى","فيديو"], featured:true, homepage_featured:true, published:true, sort_order:4 },
  { id:"seed-05", slug:"wasl", title:"وَصل", client_name:"علامة تجريبية", short_description:"منصة تربط الفكرة بجمهورها.", category:"تجارب رقمية", services:["تطوير ويب","تسويق رقمي"], featured:true, published:true, sort_order:5 },
  { id:"seed-06", slug:"saha", title:"ساحة", client_name:"مشروع تجريبي", short_description:"مساحة جديدة للقاء والتجربة.", category:"هوية بصرية", services:["تسمية","هوية بصرية"], featured:true, published:true, sort_order:6 }
];
export const seedClients: Client[] = ["علامة تجريبية","مشروع ناشئ","وجهة محلية","منصة رقمية","فكرة جديدة","مساحة إبداعية","منتج مستقل","شريك نمو"].map((name,i)=>({id:`client-${i}`,name,sort_order:i,visible:true}));
export const seedServices: Service[] = [
  {id:"s1",number:"01",title:"الاستراتيجية والعلامة",description:"نمنح الأفكار اتجاهًا واضحًا، ونبني علامات تعرف من تكون وإلى أين تتجه.",items:["استراتيجية العلامة","التسمية والتموضع","الهوية البصرية","التوجيه الإبداعي"]},
  {id:"s2",number:"02",title:"الحملات والإعلان",description:"أفكار إعلانية تجد طريقها إلى الناس، عبر قصة واحدة وصيغ متعددة.",items:["الفكرة الإبداعية","الحملات المتكاملة","الإعلان الرقمي","الإنتاج المرئي"]},
  {id:"s3",number:"03",title:"المحتوى والتواصل",description:"محتوى مستمر وواضح يمنح العلامة صوتًا حاضرًا في يوم جمهورها.",items:["استراتيجية المحتوى","إدارة المنصات","التصوير والفيديو","العلاقات العامة"]},
  {id:"s4",number:"04",title:"المنتجات الرقمية",description:"نصمم ونطور تجارب رقمية سهلة الاستخدام، من الصفحة الأولى إلى التفاصيل الصغيرة.",items:["تصميم تجربة المستخدم","تطوير المواقع","التجارة الإلكترونية","تطوير البرمجيات"]}
];
