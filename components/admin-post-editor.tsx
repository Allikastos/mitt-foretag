"use client";

import {
  startTransition,
  useEffect,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { SITE_CONFIG } from "@/config/site";
import { AdminRichTextEditor } from "@/components/admin-rich-text-editor";
import { BlogRichText } from "@/components/blog-rich-text";
import {
  BLOG_IMAGES_BUCKET,
  getSupabaseBrowserClient,
  hasSupabaseEnv,
  type PostRow,
  type PostStatus,
} from "@/src/lib/supabase";

type AdminPostEditorProps = {
  initialPosts: PostRow[];
};

type PostFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
  status: PostStatus;
  publishAt: string;
};

const initialFormState: PostFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "<p></p>",
  imageUrl: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  publishAt: "",
};

const cardClassName =
  "rounded-[1.7rem] border border-black/8 bg-white p-5 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.14)] sm:p-6 md:rounded-[1.9rem] md:p-7";

const inputClassName =
  "min-h-11 w-full rounded-[1.1rem] border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]";

const textareaClassName =
  "w-full rounded-[1.25rem] border border-black/10 bg-[#F7F7F5] px-4 py-3.5 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]";

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function getStatusLabel(status: PostStatus) {
  switch (status) {
    case "published":
      return "Publicerad";
    case "scheduled":
      return "Schemalagd";
    default:
      return "Utkast";
  }
}

function isLiveByPublishDate(status: PostStatus, publishAt: string | null) {
  if (!publishAt) {
    return status === "published";
  }

  if (status !== "published" && status !== "scheduled") {
    return false;
  }

  return new Date(publishAt).getTime() <= Date.now();
}

function getDisplayStatusLabel(status: PostStatus, publishAt: string | null) {
  if (isLiveByPublishDate(status, publishAt)) {
    return "Publicerad";
  }

  return getStatusLabel(status);
}

function createFormState(post?: PostRow): PostFormState {
  if (!post) {
    return initialFormState;
  }

  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    imageUrl: post.image_url ?? "",
    seoTitle: post.seo_title ?? "",
    seoDescription: post.seo_description ?? "",
    status: post.status,
    publishAt: toDateTimeLocalValue(post.publish_at),
  };
}

function hasMeaningfulContent(value: string) {
  if (/<img\b/i.test(value)) {
    return true;
  }

  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim().length > 0;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function AdminPostEditor({ initialPosts }: AdminPostEditorProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [form, setForm] = useState<PostFormState>(initialFormState);
  const [isUploading, setIsUploading] = useState(false);
  const [savingIntent, setSavingIntent] = useState<PostStatus | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const selectedPost =
    posts.find((post) => post.id === selectedPostId) ?? null;
  const googleTitle = form.seoTitle.trim() || form.title.trim() || "SEO-titel";
  const googleDescription =
    form.seoDescription.trim() ||
    form.excerpt.trim() ||
    "Meta-beskrivning visas här när du fyller i utdrag eller SEO-beskrivning.";
  const googleUrl = form.slug
    ? `${SITE_CONFIG.domain}/blogg/${form.slug}`
    : `${SITE_CONFIG.domain}/blogg/din-slug`;
  const seoTitleLength = form.seoTitle.trim().length;
  const seoDescriptionLength = form.seoDescription.trim().length;

  function resetForm() {
    setSelectedPostId(null);
    setForm(initialFormState);
    setSlugTouched(false);
    setFeedback(null);
    setErrorMessage(null);
  }

  function handleSelectPost(post: PostRow) {
    setSelectedPostId(post.id);
    setForm(createFormState(post));
    setSlugTouched(true);
    setFeedback(null);
    setErrorMessage(null);
  }

  function handleFieldChange<Key extends keyof PostFormState>(
    key: Key,
    value: PostFormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const title = event.target.value;
    const nextSlug = slugify(title);

    setForm((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : nextSlug,
    }));
  }

  async function uploadImage(file: File) {
    if (!hasSupabaseEnv()) {
      throw new Error(
        "Supabase är inte konfigurerat ännu. Lägg till miljövariablerna först."
      );
    }

    const supabase = getSupabaseBrowserClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filePath = `posts/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(
        "Bilden kunde inte laddas upp. Kontrollera att bucketen och storage-policys finns i Supabase."
      );
    }

    const { data } = supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      const publicUrl = await uploadImage(file);

      setForm((current) => ({
        ...current,
        imageUrl: publicUrl,
      }));
      setFeedback("Omslagsbilden laddades upp och lades in i featured image.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Bilden kunde inte laddas upp."
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function persistPost(nextStatus: PostStatus) {
    if (!hasSupabaseEnv()) {
      setErrorMessage(
        "Supabase är inte konfigurerat ännu. Lägg till miljövariablerna först."
      );
      return;
    }

    const slug = slugify(form.slug || form.title);

    if (!form.title.trim() || !slug || !hasMeaningfulContent(form.content)) {
      setErrorMessage("Titel, slug och artikelinnehåll måste fyllas i.");
      return;
    }

    if (nextStatus === "scheduled" && !form.publishAt) {
      setErrorMessage(
        "Välj ett publiceringsdatum innan du schemalägger inlägget."
      );
      return;
    }

    setSavingIntent(nextStatus);
    setErrorMessage(null);
    setFeedback(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const publishAtIso =
        nextStatus === "published"
          ? form.publishAt
            ? new Date(form.publishAt).toISOString()
            : new Date().toISOString()
          : form.publishAt
            ? new Date(form.publishAt).toISOString()
            : null;

      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim(),
        image_url: form.imageUrl.trim() || null,
        seo_title: form.seoTitle.trim() || null,
        seo_description: form.seoDescription.trim() || null,
        status: nextStatus,
        publish_at: publishAtIso,
      };

      const query = selectedPostId
        ? supabase
            .from("posts")
            .update(payload)
            .eq("id", selectedPostId)
            .select()
            .single()
        : supabase.from("posts").insert(payload).select().single();

      const { data, error } = await query;

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!data) {
        setErrorMessage(
          "Inlägget kunde inte sparas. Supabase returnerade inget svar."
        );
        return;
      }

      const updatedPosts = selectedPostId
        ? posts.map((post) => (post.id === data.id ? data : post))
        : [data, ...posts];

      updatedPosts.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setPosts(updatedPosts);
      setSelectedPostId(data.id);
      setForm(createFormState(data));
      setSlugTouched(true);
      setFeedback(
        nextStatus === "draft"
          ? "Inlägget sparades som utkast."
          : nextStatus === "scheduled"
            ? "Inlägget schemalades."
            : "Inlägget publicerades."
      );

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to persist post", error);
      setErrorMessage(
        getErrorMessage(
          error,
          "Inlägget kunde inte sparas just nu. Kontrollera anslutningen till Supabase och försök igen."
        )
      );
    } finally {
      setSavingIntent(null);
    }
  }

  return (
    <form
      className="space-y-5 md:space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void persistPost(form.status);
      }}
    >
      <div className="rounded-[1.9rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbf8_100%)] p-6 shadow-[0_28px_60px_-52px_rgba(0,0,0,0.18)] md:rounded-[2.15rem] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Inläggsredigerare
            </p>
            <h2 className="mt-3 text-[1.85rem] font-semibold tracking-[-0.045em] text-[#0B0B0C] md:mt-4 md:text-[2.4rem]">
              Redigera och publicera artiklar
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {selectedPost ? (
              <span className="inline-flex max-w-full items-center truncate rounded-full border border-black/10 bg-white px-3.5 py-2 text-[11px] font-medium tracking-[0.16em] text-[#5F5F5F] uppercase">
                Redigerar: {selectedPost.title}
              </span>
            ) : null}

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:border-black/15 hover:bg-[#F7F7F5]"
            >
              Nytt inlägg
            </button>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-[1.5rem] border border-[#C6A15B]/30 bg-[#F7F3EA] px-4 py-3 text-sm leading-6 text-[#0B0B0C]">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_21rem]">
        <div className="space-y-5">
          <section className={cardClassName}>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Grunddata
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-[1.45rem]">
              Titel, slug och sammanfattning
            </h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  Titel
                </span>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="Exempel: Så skapar du bättre ekonomisk kontroll"
                  className={inputClassName}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  Slug
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    handleFieldChange("slug", slugify(event.target.value));
                  }}
                  placeholder="sa-skapar-du-battre-ekonomisk-kontroll"
                  className={inputClassName}
                  required
                />
                <p className="mt-2 text-xs leading-5 text-[#6B6B6B]">
                  Kort, beskrivande och helst utan onödiga småord.
                </p>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  Kort beskrivning / excerpt
                </span>
                <textarea
                  rows={4}
                  value={form.excerpt}
                  onChange={(event) =>
                    handleFieldChange("excerpt", event.target.value)
                  }
                  placeholder="Kort sammanfattning som visas i blogglistan och kan användas som grund för metadata."
                  className={textareaClassName}
                />
              </label>
            </div>
          </section>

          <section className={cardClassName}>
            <div>
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Artikelinnehåll
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-[1.45rem]">
                Rich text-editor
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">
                Formatera texten direkt i editorn med rubriker, listor, länkar,
                kursiv stil, fetstil och bilder utan att skriva HTML manuellt.
              </p>
            </div>

            <div className="mt-5">
              <AdminRichTextEditor
                value={form.content}
                onChange={(nextValue) => handleFieldChange("content", nextValue)}
                onUploadImage={uploadImage}
              />
            </div>
          </section>
        </div>

        <div className="space-y-5 xl:pt-1">
          <aside className={cardClassName}>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Publicering
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-[-0.025em] text-[#0B0B0C]">
              Status och actions
            </h3>

            <div className="mt-4 rounded-[1.15rem] border border-black/8 bg-[#FCFCFA] px-4 py-3">
              <p className="text-xs tracking-[0.16em] text-[#6B6B6B] uppercase">
                Nuvarande status
              </p>
              <p className="mt-2 text-sm font-medium text-[#0B0B0C]">
                {getDisplayStatusLabel(form.status, form.publishAt || null)}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  Status
                </span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    handleFieldChange(
                      "status",
                      event.target.value as PostStatus
                    )
                  }
                  className={inputClassName}
                >
                  <option value="draft">Utkast</option>
                  <option value="scheduled">Schemalagd</option>
                  <option value="published">Publicerad</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  Publiceringsdatum
                </span>
                <input
                  type="datetime-local"
                  value={form.publishAt}
                  onChange={(event) =>
                    handleFieldChange("publishAt", event.target.value)
                  }
                  className={inputClassName}
                />
                <p className="mt-2 text-xs leading-5 text-[#6B6B6B]">
                  Lämnas datumet tomt vid publicering används nuvarande tid.
                </p>
              </label>
            </div>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
              <ActionButton
                label="Spara utkast"
                tone="secondary"
                isLoading={savingIntent === "draft"}
                onClick={() => void persistPost("draft")}
              />
              <ActionButton
                label="Schemalägg"
                tone="secondary"
                isLoading={savingIntent === "scheduled"}
                onClick={() => void persistPost("scheduled")}
              />
              <ActionButton
                label="Publicera"
                tone="primary"
                isLoading={savingIntent === "published"}
                onClick={() => void persistPost("published")}
              />
            </div>

            {selectedPost ? (
              <div className="mt-4">
                <LinkButton
                  href={`/blogg/${selectedPost.slug}`}
                  label="Förhandsvisa inlägg"
                />
              </div>
            ) : null}
          </aside>

          <aside className={cardClassName}>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Bild / featured image
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  Bild-URL
                </span>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) =>
                    handleFieldChange("imageUrl", event.target.value)
                  }
                  placeholder="https://..."
                  className={inputClassName}
                />
              </label>

              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[1rem] border border-black/10 bg-[#F7F7F5] px-4 py-2.5 text-sm font-medium text-[#0B0B0C] transition hover:bg-white">
                {isUploading ? "Laddar upp..." : "Ladda upp till Storage"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="sr-only"
                  disabled={isUploading}
                />
              </label>

              <p className="text-xs leading-5 text-[#6B6B6B]">
                Uppladdning använder bucketen <code>{BLOG_IMAGES_BUCKET}</code>.
              </p>
            </div>

            {form.imageUrl ? (
              <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-black/8 bg-[#F7F7F5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt={form.title || "Omslagsbild"}
                  className="h-52 w-full object-cover"
                />
              </div>
            ) : null}
          </aside>

          <aside className={cardClassName}>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              URL och SEO
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  SEO title
                </span>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(event) =>
                    handleFieldChange("seoTitle", event.target.value)
                  }
                  placeholder="Valfritt. Om tom används inläggets titel."
                  className={inputClassName}
                />
                <p className="mt-2 text-xs leading-5 text-[#6B6B6B]">
                  Sikta gärna på cirka 50–60 tecken. Nu: {seoTitleLength}
                </p>
              </label>

              <label className="block">
                <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                  Meta description
                </span>
                <textarea
                  rows={4}
                  value={form.seoDescription}
                  onChange={(event) =>
                    handleFieldChange("seoDescription", event.target.value)
                  }
                  placeholder="Valfritt. Om tom används utdraget."
                  className={textareaClassName}
                />
                <p className="mt-2 text-xs leading-5 text-[#6B6B6B]">
                  Försök hålla dig runt 140–160 tecken. Nu: {seoDescriptionLength}
                </p>
              </label>
            </div>
          </aside>

          <aside className={cardClassName}>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Google-preview
            </p>
            <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-[#FCFCFA] px-4 py-4">
              <p className="line-clamp-2 text-[1.05rem] leading-6 text-[#1A0DAB]">
                {googleTitle}
              </p>
              <p className="mt-1 text-xs text-[#006621]">{googleUrl}</p>
              <p className="mt-2 text-sm leading-6 text-[#4D5156]">
                {googleDescription}
              </p>
            </div>
          </aside>

          <aside className={cardClassName}>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Live preview
            </p>

            <div className="mt-5 rounded-[1.35rem] border border-black/8 bg-[#FCFCFA] p-4 sm:p-5">
              {form.imageUrl ? (
                <div className="overflow-hidden rounded-[1.2rem] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt={form.title || "Förhandsvisning"}
                    className="h-44 w-full object-cover"
                  />
                </div>
              ) : null}

              <p className="mt-4 text-xs tracking-[0.16em] text-[#6B6B6B] uppercase">
                /blogg/{form.slug || "din-slug"}
              </p>
              <h4 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
                {form.title || "Titel på inlägget"}
              </h4>
              <p className="mt-3 text-sm leading-7 text-[#5F5F5F]">
                {form.excerpt ||
                  "Utdraget kommer att ge en snabb överblick av artikeln här."}
              </p>

              {hasMeaningfulContent(form.content) ? (
                <div className="mt-5 max-h-[18rem] overflow-hidden border-t border-black/8 pt-5">
                  <BlogRichText
                    content={form.content}
                    className="text-sm leading-7 [&_h2]:text-xl [&_h3]:text-lg [&_img]:rounded-[1rem]"
                  />
                </div>
              ) : null}
            </div>
          </aside>

          <aside className={cardClassName}>
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Befintliga inlägg
            </p>

            {posts.length > 0 ? (
              <div className="mt-5 space-y-3 xl:max-h-[28rem] xl:overflow-y-auto xl:pr-1">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handleSelectPost(post)}
                    className={`w-full rounded-[1.2rem] border px-4 py-3.5 text-left transition ${
                      selectedPostId === post.id
                        ? "border-[#C6A15B]/45 bg-[#F7F3EA]"
                        : "border-black/8 bg-[#FCFCFA] hover:border-black/14"
                    }`}
                  >
                    <p className="text-sm font-medium text-[#0B0B0C]">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[#6B6B6B]">
                      /blogg/{post.slug}
                    </p>
                    <p className="mt-2 text-[11px] font-medium tracking-[0.15em] text-[#6B6B6B] uppercase">
                      {getDisplayStatusLabel(post.status, post.publish_at)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-[#5F5F5F]">
                Inga inlägg finns ännu. Skapa ditt första direkt i editorn.
              </p>
            )}
          </aside>
        </div>
      </div>
    </form>
  );
}

function ActionButton({
  label,
  tone,
  isLoading,
  onClick,
}: {
  label: string;
  tone: "primary" | "secondary";
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center rounded-[1rem] px-4 py-2.5 text-sm font-medium transition ${
        tone === "primary"
          ? "bg-[#0B0B0C] text-white shadow-[0_18px_35px_-28px_rgba(0,0,0,0.38)] hover:opacity-90"
          : "border border-black/10 bg-[#F7F7F5] text-[#0B0B0C] hover:bg-white"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isLoading ? "Sparar..." : label}
    </button>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 w-full items-center justify-center rounded-[1rem] border border-black/10 bg-[#FCFCFA] px-4 py-2.5 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#F7F7F5]"
    >
      {label}
    </a>
  );
}
