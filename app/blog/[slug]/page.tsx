import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, BadgeCheck, UserRound } from 'lucide-react';
import { DEFAULT_BLOG_AUTHOR_URL, getAllPosts, getPostBySlug, getRelatedPosts, formatDate } from '@/lib/blog';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import TagBadge from '@/app/components/blog/TagBadge';
import RelatedPosts from '@/app/components/blog/RelatedPosts';
import SiteFooter from '@/app/components/SiteFooter';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const ogImage = post.thumbnail.startsWith('http')
    ? post.thumbnail
    : `${SITE_URL}${post.thumbnail}`;

  return {
    title: `${post.title} | ${SITE_NAME} Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, post.tags, 3);

  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);

  // Dynamic import of MDX content
  let Content: React.ComponentType;
  try {
    const mdxModule = await import(`@/content/blog/${slug}.mdx`);
    Content = mdxModule.default;
  } catch {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        data-schema="article"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-[#0a0a0a]">
        <article className="max-w-[800px] mx-auto px-6 sm:px-12 pt-12 pb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#a0a0a0] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#808080]" data-testid="article-evidence">
              <a
                href={DEFAULT_BLOG_AUTHOR_URL}
                target="_blank"
                rel="author noopener noreferrer"
                className="flex items-center gap-1 text-[#a0a0a0] transition-colors hover:text-white"
              >
                <UserRound size={14} />
                By {post.author}
              </a>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {post.readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Published {formatDate(post.date)}
              </span>
              {post.updated && <span>Updated {formatDate(post.updated)}</span>}
              {post.testedVersion && (
                <span className="flex items-center gap-1 text-[#E91E8C]">
                  <BadgeCheck size={14} />
                  Tested with YTgify v{post.testedVersion}
                </span>
              )}
            </div>
          </header>

          {post.thumbnail && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.thumbnail}
                alt={post.title}
                width={1200}
                height={630}
                priority
                sizes="(max-width: 800px) 100vw, 704px"
                className="h-auto w-full"
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <Content />
          </div>

          <aside className="mt-10 border border-[#2a2a2a] bg-[#111111] p-5" aria-label="About the author">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E91E8C]">About the author</p>
            <p className="mt-2 text-sm leading-relaxed text-[#a0a0a0]">
              <a
                href={DEFAULT_BLOG_AUTHOR_URL}
                target="_blank"
                rel="author noopener noreferrer"
                className="font-semibold text-white underline decoration-[#E91E8C] underline-offset-4"
              >
                {post.author}
              </a>{' '}
              builds YTgify and documents the product behavior used in these guides. Product details on this page were checked against the version shown above.
            </p>
          </aside>

          <RelatedPosts posts={relatedPosts} />
        </article>
        <SiteFooter />
      </main>
    </>
  );
}
