import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { blogPosts } from "@/content/blogPosts";
import { useSeo } from "@/hooks/useSeo";
import { Button } from "@/components/ui/button";

const SITE = "https://decisionclarity-ai.lovable.app";

const Blog = () => {
  useSeo({
    title: "Decision-Making Blog — Frameworks, Biases & Clarity | Clair",
    description:
      "Practical, research-backed articles on decision making, cognitive biases, and frameworks to help you think clearer and choose with confidence.",
    canonicalPath: "/blog",
    keywords:
      "decision making blog, decision frameworks, cognitive biases, how to make better decisions, decision making app, overthinking",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Clair — Decision-Making Blog",
        url: `${SITE}/blog`,
        description:
          "Articles on decision-making frameworks, cognitive biases, and tools to make better choices.",
        blogPost: blogPosts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          datePublished: p.publishedAt,
          url: `${SITE}/blog/${p.slug}`,
          author: { "@type": "Organization", name: "Clair" },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
        ],
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Clair
          </Link>
          <Button asChild size="sm" variant="default">
            <Link to="/auth">Try Clair free</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            The Clarity Journal
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Better decisions, written down.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Frameworks, biases, and field-tested techniques for the moments
            that actually matter. No fluff. No motivational posters.
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="group block h-full rounded-xl border border-border/60 bg-card hover:border-primary/60 hover:shadow-md transition-all p-6"
              >
                <div className="text-xs uppercase tracking-wider text-primary/80 mb-2">
                  {post.category}
                </div>
                <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readMinutes} min read
                  </span>
                  <span>·</span>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Stop reading about decisions. Start making them clearer.
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Clair walks you through the frameworks in this blog, step by step,
            in about ten minutes per decision.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Try Clair free →</Link>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Blog;
