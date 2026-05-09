'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: () => <p>Loading editor...</p> });

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ id: null, title: '', slug: '', content: '', cover_image: '', published: false });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (err) {
      if (err.code === '42P01') {
        setError('Table "blogs" does not exist. Please run the provided SQL script in Supabase to create it.');
      } else {
        setError(err.message);
      }
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenForm = (blog = null) => {
    if (blog) {
      setForm(blog);
      setCoverPreview(blog.cover_image || '');
    } else {
      setForm({ id: null, title: '', slug: '', content: '', cover_image: '', published: false });
      setCoverPreview('');
    }
    setCoverFile(null);
    setIsFormOpen(true);
    setError('');
  };

  const generateSlug = (text) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    if (!form.id) { // Auto-generate slug only for new posts
      setForm({ ...form, title: newTitle, slug: generateSlug(newTitle) });
    } else {
      setForm({ ...form, title: newTitle });
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setCoverFile(null);
    setCoverPreview('');
    setForm({ ...form, cover_image: '' });
  };

  const uploadCoverImage = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `blog-covers/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('listing-images').upload(path, file);
    if (error) throw new Error('Image upload failed: ' + error.message);
    const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path);
    return publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let coverImageUrl = form.cover_image;

      // Upload new cover image if a file was selected
      if (coverFile) {
        setUploading(true);
        coverImageUrl = await uploadCoverImage(coverFile);
        setUploading(false);
      }

      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        cover_image: coverImageUrl,
        published: form.published,
        updated_at: new Date().toISOString()
      };

      let err;
      if (form.id) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', form.id);
        err = error;
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        err = error;
      }

      if (err) throw err;
      
      await fetchBlogs();
      setIsFormOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      alert('Failed to delete: ' + error.message);
    } else {
      fetchBlogs();
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Blog Posts</h1>
          <p className="page-subtitle">Manage platform news, articles, and guides.</p>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            Write New Post
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: 16, background: '#FEF2F2', color: '#B91C1C', borderRadius: 8, marginBottom: 24, border: '1px solid #FCA5A5' }}>
          <strong>Notice:</strong> {error}
        </div>
      )}

      {isFormOpen ? (
        <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>{form.id ? 'Edit Post' : 'New Post'}</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsFormOpen(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="form-input" value={form.title} onChange={handleTitleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Slug (URL)</label>
              <input type="text" className="form-input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Example: my-first-blog-post</div>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image</label>
              {coverPreview ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 8 }}>
                  <img src={coverPreview} alt="Cover preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={removeCoverImage} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, border: '2px dashed var(--border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-secondary)' }}>
                  <input type="file" accept="image/*" onChange={handleCoverFileChange} style={{ display: 'none' }} />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ marginTop: 8, fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 500 }}>Click to upload cover image</span>
                  <span style={{ marginTop: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>PNG, JPG, WEBP up to 5MB</span>
                </label>
              )}
              {coverFile && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>📎 {coverFile.name}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 60 }}>
              <label className="form-label">Content</label>
              <div style={{ height: 300 }}>
                <ReactQuill 
                  theme="snow" 
                  value={form.content} 
                  onChange={(val) => setForm({...form, content: val})} 
                  modules={modules}
                  style={{ height: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40 }}>
              <input 
                type="checkbox" 
                id="published" 
                checked={form.published} 
                onChange={e => setForm({...form, published: e.target.checked})} 
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="published" style={{ fontWeight: 500, cursor: 'pointer' }}>Publish immediately</label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Post'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog.id}>
                  <td>
                    <strong>{blog.title}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>/{blog.slug}</div>
                  </td>
                  <td>
                    <span className={`badge ${blog.published ? 'badge-primary' : 'badge-warning'}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleOpenForm(blog)}>Edit</button>
                      <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(blog.id)}>Delete</button>
                      {blog.published && (
                        <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost">View</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                    No blog posts found. Create your first post!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
