export function StructuredData() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mohamed Ragab Studio",
    alternateName: ["محمد رجب", "Mohamed Ragab"],
    url: base,
    logo: `${base}/brand/MRS_Black_Vertical.png`,
    sameAs: [],
  };
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mohamed Ragab",
    alternateName: "محمد رجب طولبه",
    url: `${base}/about`,
    worksFor: { "@type": "Organization", name: "Mohamed Ragab Studio", url: base },
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} /></>;
}
