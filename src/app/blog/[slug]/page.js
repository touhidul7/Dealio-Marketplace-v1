'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './blog.module.css';

export default function SingleBlogPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', params.slug)
        .eq('published', true)
        .single();
      
      if (error || !data) {
        setError('Blog post not found.');
      } else {
        setBlog(data);
      }
      setLoading(false);
    };
    if (params?.slug) fetchBlog();
  }, [params.slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div style={{ paddingTop: 40, paddingBottom: 60 }}>
      {loading ? (
        <div className={styles.blogLoading}>
          <div className="spinner"></div>
        </div>
      ) : error || !blog ? (
        <div className={styles.blogNotFound}>
          <h1>{error || 'Post Not Found'}</h1>
          <Link href="/blog" className="btn btn-primary">Back to Blog</Link>
        </div>
      ) : (
        <article className={styles.article}>
          <Link href="/blog" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to all posts
          </Link>

          <header className={styles.articleHeader}>
            <div className={styles.articleMeta}>
              <span className={styles.articleTag}>Article</span>
              <span className={styles.articleDate}>
                {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className={styles.articleTitle}>
              {blog.title}
            </h1>
          </header>

          {blog.cover_image && (
            <div className={styles.coverImage}>
              <img src={blog.cover_image} alt={blog.title} />
            </div>
          )}

          <div 
            className={styles.blogContent}
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />

          <div className={styles.articleFooter}>
            <Link href="/blog" className={styles.backLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              More articles
            </Link>
            <div className={styles.shareSection}>
              <span className={styles.shareLabel}>Share</span>
              <button className={styles.shareBtn} onClick={copyLink} title="Copy link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <a className={styles.shareBtn} href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`} target="_blank" rel="noreferrer" title="Share on X">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a className={styles.shareBtn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`} target="_blank" rel="noreferrer" title="Share on LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
