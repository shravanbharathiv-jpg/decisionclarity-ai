import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/content/blogPosts";
import { useSeo } from "@/hooks/useSeo";
import { Button } from "@/components/ui/button";

const SITE = "https://decisionclarity-ai.lovable.app";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const post = getPostBySlug(slug);
  const related = post ? blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2) : [];

  useSeo({
    title: post ? `${post.title} | Clair` : "Article not found | Clair",
    description: post?.description ?? "This article could not be found.",
    canonicalPath: post ? `/blog/${post.slug}` : "/blog",
    keywords: post?.keywords,
    ogType: "article",
    jsonLd: post
      ? [

      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: { "@type": "Organization", name: "Clair" },
        publisher: {
          "@type": "Organization",
          name: "Clair",
          logo: { "@type": "ImageObject", url: `${SITE}/og-image.png` },
        },
        mainEntityOfPage: `${SITE}/blog/${post.slug}`,
        keywords: post.keywords,
        articleSection: post.category,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `${SITE}/blog/${post.slug}`,
          },
        ],
      ]
      : undefined,
  });

  if (!post) {
    return <Navigate to="/blog" replace />;
  }



  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All articles
          </Link>
          <Button asChild size="sm">
            <Link to="/auth">Try Clair free</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <article>
          <div className="mb-8">
            <div className="text-xs uppercase tracking-wider text-primary/80 mb-3">
              {post.category}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readMinutes} min read
              </span>
              <span>·</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
          </div>

          <div className="prose-clair max-w-none space-y-5">
            {post.body.map((block, i) => {
              switch (block.type) {
                case "h2":
                  return (
                    <h2
                      key={i}
                      className="text-2xl sm:text-3xl font-bold mt-10 mb-2 tracking-tight"
                    >
                      {block.text}
                    </h2>
                  );
                case "h3":
                  return (
                    <h3
                      key={i}
                      className="text-xl font-semibold mt-6 mb-1 tracking-tight"
                    >
                      {block.text}
                    </h3>
                  );
                case "p":
                  return (
                    <p
                      key={i}
                      className="text-base sm:text-lg leading-relaxed text-foreground/90"
                    >
                      {block.text}
                    </p>
                  );
                case "ul":
                  return (
                    <ul
                      key={i}
                      className="list-disc pl-6 space-y-2 text-base sm:text-lg text-foreground/90"
                    >
                      {block.items.map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  );
                case "ol":
                  return (
                    <ol
                      key={i}
                      className="list-decimal pl-6 space-y-2 text-base sm:text-lg text-foreground/90"
                    >
                      {block.items.map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ol>
                  );
                case "quote":
                  return (
                    <blockquote
                      key={i}
                      className="border-l-4 border-primary/60 pl-4 italic text-foreground/80 my-6"
                    >
                      "{block.text}"
                      {block.cite && (
                        <footer className="text-sm not-italic text-muted-foreground mt-2">
                          — {block.cite}
                        </footer>
                      )}
                    </blockquote>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </article>

        <section className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Run your next real decision through Clair.
          </h2>
          <p className="text-muted-foreground mb-5 max-w-lg mx-auto">
            The frameworks above, built into a 10-minute guided flow.
            Private, encrypted, free to try.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Start a free decision →</Link>
          </Button>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-4">Keep reading</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/blog/${r.slug}`}
                    className="block rounded-xl border border-border/60 bg-card hover:border-primary/60 transition-all p-5"
                  >
                    <div className="text-xs uppercase tracking-wider text-primary/80 mb-2">
                      {r.category}
                    </div>
                    <h3 className="font-semibold mb-1">{r.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {r.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};

export default BlogPost;
