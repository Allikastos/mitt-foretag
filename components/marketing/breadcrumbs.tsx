import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { SectionContainer } from "@/components/section-container";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, SITE_CONFIG.url).toString() } : {}),
    })),
  };

  return (
    <div className="pt-8">
      <SectionContainer>
        <nav aria-label="Brödsmulor" className="text-sm text-[#617169]">
          <ol className="flex flex-wrap items-center gap-2">
            {items.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {item.href ? (
                  <Link href={item.href} className="transition hover:text-[#173f35]">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-[#173f35]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </SectionContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
