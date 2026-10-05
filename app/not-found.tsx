import Image from "next/image";
import Link from "next/link";
import { T } from "@/components/language";

export default function NotFound() {
  return <section className="not-found content-wrap">
    <div className="eyebrow">404 <span>✳</span> <T ar="الصفحة غير موجودة" en="Page not found" /></div>
    <Image src="/images/404-art.svg" alt="" width={1200} height={560} className="not-found-image" priority />
    <h1><T ar={<>يبدو أننا ابتعدنا<br />عن الطريق.</>} en={<>Looks like we took<br />a wrong turn.</>} /></h1>
    <p><T ar="الرابط الذي فتحته لا يقود إلى صفحة موجودة. لنعد إلى البداية ونكمل الاستكشاف." en="The link you followed doesn’t lead to a page here. Let’s head back and keep exploring." /></p>
    <Link className="text-link" href="/"><T ar="العودة إلى الرئيسية ↙" en="Back to home ↙" /></Link>
  </section>;
}
