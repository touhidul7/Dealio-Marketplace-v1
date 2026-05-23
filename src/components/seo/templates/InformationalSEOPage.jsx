'use client';

import { useState } from 'react';
import SEOHero from '../SEOHero';
import SEOCTA from '../SEOCTA';
import RelatedLinks from '../RelatedLinks';
import FAQSection from '../FAQSection';

export default function InformationalSEOPage({ page }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [downloadName, setDownloadName] = useState('');
  const [downloadEmail, setDownloadEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Checklist handler
  const handleToggleCheck = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Download handler
  const handleDownloadSubmit = (e) => {
    e.preventDefault();
    if (!downloadName || !downloadEmail) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setDownloadSuccess(true);
    }, 800);
  };

  // Calculate checklist progress
  const checklist = page.checklistItems || [];
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  return (
    <>
      <SEOHero title={page.h1} intro={page.intro} />

      <div className="container" style={{ paddingBottom: '80px', paddingTop: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Main Article Content */}
          {page.contentSections && page.contentSections.map((section, idx) => (
            <section key={idx} style={{ marginBottom: '40px' }}>
              {section.title && (
                <h2 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 800, 
                  color: 'var(--gray-900, #111827)', 
                  marginBottom: '16px',
                  fontFamily: 'var(--font-display, var(--font-sans))'
                }}>
                  {section.title}
                </h2>
              )}
              
              {/* Text rendering */}
              {section.text && (
                Array.isArray(section.text) ? (
                  section.text.map((p, pIdx) => (
                    <p key={pIdx} style={{ fontSize: '1.05rem', lineHeight: '1.75', color: 'var(--text-secondary, #4b5563)', marginBottom: '16px' }}>
                      {p}
                    </p>
                  ))
                ) : (
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.75', color: 'var(--text-secondary, #4b5563)', marginBottom: '16px' }}>
                    {section.text}
                  </p>
                )
              )}

              {/* Bullet Points */}
              {section.bulletPoints && (
                <ul style={{ 
                  listStyleType: 'none', 
                  paddingLeft: '0', 
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {section.bulletPoints.map((bullet, bIdx) => (
                    <li key={bIdx} style={{ 
                      fontSize: '1.05rem', 
                      color: 'var(--text-secondary, #4b5563)', 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <span style={{ color: 'var(--primary, #0f52ba)', fontWeight: 'bold' }}>✓</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Data Table */}
              {section.table && (
                <div style={{ overflowX: 'auto', margin: '24px 0', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--gray-50, #f9fafb)', borderBottom: '2px solid var(--gray-200, #e5e7eb)' }}>
                        {section.table.headers.map((h, hIdx) => (
                          <th key={hIdx} style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--gray-800, #1f2937)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid var(--gray-100, #f3f4f6)', backgroundColor: rIdx % 2 === 0 ? 'white' : 'var(--gray-50, #f9fafb)' }}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '12px 16px', color: 'var(--text-secondary, #4b5563)' }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {/* INTERACTIVE COMPONENT: CHECKLIST */}
          {page.interactiveType === 'checklist' && checklist.length > 0 && (
            <div style={{ 
              background: 'white', 
              border: '1px solid var(--gray-200, #e5e7eb)', 
              borderRadius: '16px', 
              padding: '36px 32px', 
              boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.05))',
              marginBottom: '50px',
              marginTop: '40px'
            }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900, #111827)', marginBottom: '8px' }}>
                Interactive Progress Tracker
              </h3>
              <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '0.95rem', marginBottom: '24px' }}>
                Check off items as you complete them to track your deal readiness.
              </p>

              {/* Progress Indicator */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary, #0f52ba)', marginBottom: '8px' }}>
                  <span>Readiness Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--gray-100, #f3f4f6)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary, #0f52ba), var(--accent, #f59e0b))', borderRadius: '100px', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Checklist list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {checklist.map((item, idx) => {
                  const isChecked = !!checkedItems[idx];
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleToggleCheck(idx)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px 16px', 
                        border: `1px solid ${isChecked ? 'var(--primary-100, #dbeafe)' : 'var(--gray-200, #e5e7eb)'}`, 
                        borderRadius: '10px', 
                        background: isChecked ? 'var(--primary-50, #eff6ff)' : 'white', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${isChecked ? 'var(--primary, #0f52ba)' : 'var(--gray-400, #9ca3af)'}`,
                        background: isChecked ? 'var(--primary, #0f52ba)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        flexShrink: 0
                      }}>
                        {isChecked && '✓'}
                      </div>
                      <span style={{ 
                        fontSize: '1rem', 
                        color: isChecked ? 'var(--gray-500, #6b7280)' : 'var(--gray-900, #111827)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        transition: 'all 0.2s'
                      }}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INTERACTIVE COMPONENT: DOWNLOAD PREVIEW */}
          {page.interactiveType === 'download' && (
            <div style={{ 
              background: 'white', 
              border: '1px solid var(--gray-200, #e5e7eb)', 
              borderRadius: '16px', 
              padding: '36px 32px', 
              boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.05))',
              marginBottom: '50px',
              marginTop: '40px',
              textAlign: 'center'
            }}>
              
              {/* Mock PDF Visual */}
              <div style={{ 
                width: '120px', 
                height: '150px', 
                margin: '0 auto 24px', 
                background: 'linear-gradient(135deg, var(--gray-900, #111827), var(--primary-900, #0c2340))', 
                borderRadius: '8px 16px 8px 8px', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                color: 'white',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '0 16px 0 8px' }} />
                <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Dealio PDF</div>
                <div style={{ fontSize: '24px' }}>📄</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: '1.2' }}>{page.h1.split(' ').slice(0, 3).join(' ')}</div>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900, #111827)', marginBottom: '8px' }}>
                Download Your Free {page.h1}
              </h3>
              <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '0.95rem', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                Join 5,000+ Canadian buyers and sellers who use our structured resources to complete successful acquisitions.
              </p>

              {downloadSuccess ? (
                <div style={{ 
                  background: '#d1fae5', 
                  color: '#065f46', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  fontWeight: 600, 
                  fontSize: '1rem',
                  animation: 'slideIn 0.3s ease'
                }}>
                  🎉 Success! We have sent the direct download link for the <strong>{page.h1}</strong> to your email ({downloadEmail}). Please check your inbox.
                </div>
              ) : (
                <form onSubmit={handleDownloadSubmit} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={downloadName}
                      onChange={(e) => setDownloadName(e.target.value)}
                      style={{ padding: '12px 14px', border: '1px solid var(--gray-300)', borderRadius: '10px', fontSize: '0.95rem', width: '100%' }}
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      required
                      value={downloadEmail}
                      onChange={(e) => setDownloadEmail(e.target.value)}
                      style={{ padding: '12px 14px', border: '1px solid var(--gray-300)', borderRadius: '10px', fontSize: '0.95rem', width: '100%' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ 
                      padding: '13px 20px', 
                      background: 'linear-gradient(135deg, var(--primary, #0f52ba), var(--primary-dark, #0a3d8f))', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15, 82, 186, 0.2)'
                    }}
                  >
                    {isSubmitting ? 'Preparing Download Link...' : 'Request Direct Download'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Related links cluster */}
          {page.relatedLinks && page.relatedLinks.length > 0 && (
            <RelatedLinks links={page.relatedLinks} />
          )}

          {/* FAQ Section */}
          {page.faqs && page.faqs.length > 0 && (
            <FAQSection faqs={page.faqs} />
          )}

          {/* Call To Action Block */}
          <SEOCTA ctaType={page.ctaType || 'buyer'} />
        </div>
      </div>
    </>
  );
}
