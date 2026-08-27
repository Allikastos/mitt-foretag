import assert from "node:assert/strict";
import test from "node:test";
import {
  industryPages,
  marketingArticles,
} from "../../lib/marketing-seo.ts";

test("industry landing pages cover the three approved branches", () => {
  assert.deepEqual(
    industryPages.map((page) => page.slug),
    [
      "hemsida-for-malare",
      "hemsida-for-konsultbolag",
      "hemsida-for-salong",
    ],
  );

  for (const page of industryPages) {
    assert.equal(page.priorities.length, 3);
    assert.ok(page.sections.length >= 5);
    assert.ok(page.faqs.length >= 3);
    assert.match(page.package.href, /^\/tjanster\/(start|foretag)$/);
    assert.ok(page.seoTitle.toLowerCase().includes("hemsida"));
  }
});

test("article library contains four distinct high-intent website guides", () => {
  assert.equal(marketingArticles.length, 4);
  assert.equal(new Set(marketingArticles.map((article) => article.slug)).size, 4);

  for (const article of marketingArticles) {
    assert.ok(article.title.length > 20);
    assert.ok(article.description.length > 80);
    assert.ok(article.sections.length >= 4);
    assert.ok(article.conclusion.length > 100);
    assert.ok(!JSON.stringify(article).toLowerCase().includes("billig hemsida"));
  }
});
