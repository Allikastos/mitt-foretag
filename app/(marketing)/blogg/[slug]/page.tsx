import { permanentRedirect } from "next/navigation";

export default function ArchivedArticleRedirect() {
  permanentRedirect("/");
}
