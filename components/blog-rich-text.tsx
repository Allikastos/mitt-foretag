type BlogRichTextProps = {
  content: string;
  className?: string;
};

const baseClassName =
  "text-base leading-8 text-[#303030] [&_a]:font-medium [&_a]:text-[#0B0B0C] [&_a]:underline [&_a]:underline-offset-4 [&_em]:italic [&_figcaption]:mt-3 [&_figcaption]:text-sm [&_figcaption]:leading-6 [&_figcaption]:text-[#6B6B6B] [&_figure]:my-8 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-[#0B0B0C] [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-[-0.02em] [&_h3]:text-[#0B0B0C] [&_img]:w-full [&_img]:rounded-[1.5rem] [&_li]:pl-1 [&_ol]:my-5 [&_ol]:space-y-2 [&_ol>li]:ml-5 [&_ol>li]:list-decimal [&_p]:my-5 [&_strong]:text-[#0B0B0C] [&_ul]:my-5 [&_ul]:space-y-2 [&_ul>li]:ml-5 [&_ul>li]:list-disc";

export function BlogRichText({ content, className }: BlogRichTextProps) {
  return (
    <div
      className={[baseClassName, className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
