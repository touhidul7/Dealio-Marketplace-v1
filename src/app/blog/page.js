'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from('blogs')
        .select('title, slug, cover_image, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (data) setBlogs(data);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  return (
    <div style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: 16 }}>Learn & Insights</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Tips, guides, and stories to help you succeed in buying and selling businesses.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Check back later for new articles!</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {blogs.map(blog => (
              <Link key={blog.slug} href={`/blog/${blog.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  background: 'var(--surface)', 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {blog.cover_image ? (
                    <div style={{ height: 200, width: '100%', backgroundImage: `url(${blog.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ) : (
                    <div style={{ height: 200, width: '100%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0.8 }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.5.5 0 0 1 .49.6l-2.76 14.2a2 2 0 0 1-1.96 1.62H6a2 2 0 0 1-2-2z"/></svg>
                    </div>
                  )}
                  <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Article
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>
                      {blog.title}
                    </h2>
                    <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-tertiary)' }}>
                      {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
