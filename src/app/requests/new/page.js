'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { REQUEST_TYPES, COMPLIANCE_CHECKBOX_TEXT, scanForProhibitedKeywords, scanRequestForKeywords } from '@/lib/requestsConstants';
import { INDUSTRIES } from '@/lib/constants';
import styles from './new.module.css';

export default function NewRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // Steps: 1 = select type, 2 = fill form, 3 = review & submit
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    location_preference: '',
    timeline: '',
  });
  const [dynamicFields, setDynamicFields] = useState({});
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [flaggedKeywords, setFlaggedKeywords] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/requests/new');
    }
  }, [user, authLoading, router]);

  // Real-time keyword scanning
  useEffect(() => {
    const timer = setTimeout(() => {
      const allText = [
        formData.title,
        formData.description,
        ...Object.values(dynamicFields).filter(v => typeof v === 'string'),
      ].filter(Boolean).join(' ');
      const found = scanForProhibitedKeywords(allText);
      setFlaggedKeywords(found);
    }, 300);
    return () => clearTimeout(timer);
  }, [formData, dynamicFields]);

  const typeConfig = REQUEST_TYPES.find(t => t.id === selectedType);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDynamicChange = (name, value) => {
    setDynamicFields(prev => ({ ...prev, [name]: value }));
  };

  const canProceedToStep3 = () => {
    return formData.title.trim() && formData.description.trim();
  };

  const handleSubmit = async () => {
    if (!complianceAccepted) {
      setError('You must accept the compliance checkbox.');
      return;
    }
    if (flaggedKeywords.length > 0) {
      setError('Your request contains prohibited language. Please remove flagged terms before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        user_id: user.id,
        request_type: selectedType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        industry: formData.industry || null,
        location_preference: formData.location_preference || null,
        timeline: formData.timeline || null,
        dynamic_fields: dynamicFields,
        compliance_accepted: true,
        compliance_accepted_at: new Date().toISOString(),
        status: 'pending_review',
        flagged_keywords: flaggedKeywords,
      };

      const { error: insertError } = await supabase.from('requests').insert(payload);
      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successWrap}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Request Submitted!</h2>
            <p className={styles.successText}>
              Your request has been submitted for review. Our team will review it shortly and approve it if it meets our guidelines.
            </p>
            <div className={styles.successStatus}>
              <span className={styles.statusDot}></span>
              Status: Pending Review
            </div>
            <div className={styles.successActions}>
              <Link href="/requests" className="btn btn-primary">Browse Requests</Link>
              <Link href="/requests/new" className="btn btn-secondary" onClick={() => {
                setSubmitted(false);
                setStep(1);
                setSelectedType(null);
                setFormData({ title: '', description: '', industry: '', location_preference: '', timeline: '' });
                setDynamicFields({});
                setComplianceAccepted(false);
                setFlaggedKeywords([]);
              }}>Post Another</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/requests" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 12L6 8l4-4"/></svg>
            Back to Requests
          </Link>
          <h1 className={styles.pageTitle}>Post a Request</h1>
          <p className={styles.pageSubtitle}>Create an acquisition, operator, or strategic partner request.</p>
        </div>

        {/* Progress Steps */}
        <div className={styles.steps}>
          {['Select Type', 'Details', 'Review & Submit'].map((label, i) => (
            <div key={i} className={`${styles.step} ${step > i + 1 ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Type */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.sectionTitle}>What type of request are you posting?</h2>
            <div className={styles.typeGrid}>
              {REQUEST_TYPES.map(type => (
                <button
                  key={type.id}
                  className={`${styles.typeCard} ${selectedType === type.id ? styles.typeCardActive : ''}`}
                  onClick={() => setSelectedType(type.id)}
                  style={{ '--type-color': type.color }}
                >
                  <div className={styles.typeIcon}>{type.icon}</div>
                  <h3 className={styles.typeLabel}>{type.label}</h3>
                  <p className={styles.typeDesc}>{type.description}</p>
                  {selectedType === type.id && (
                    <div className={styles.typeCheck}>✓</div>
                  )}
                </button>
              ))}
            </div>
            <div className={styles.stepActions}>
              <button
                className="btn btn-primary btn-lg"
                disabled={!selectedType}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Fill Details */}
        {step === 2 && typeConfig && (
          <div className={styles.stepContent}>
            <div className={styles.formHeader}>
              <span className={styles.formBadge} style={{ '--type-color': typeConfig.color }}>
                {typeConfig.icon} {typeConfig.label}
              </span>
            </div>

            {/* Keyword Warning */}
            {flaggedKeywords.length > 0 && (
              <div className={styles.warningBanner}>
                <div className={styles.warningIcon}>⚠️</div>
                <div>
                  <strong>Prohibited language detected:</strong>
                  <p>The following terms are not allowed: <span className={styles.flaggedWords}>{flaggedKeywords.join(', ')}</span></p>
                  <p className={styles.warningNote}>Please remove these terms. Requests containing investment solicitation language will be rejected.</p>
                </div>
              </div>
            )}

            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>Basic Information</h3>
              <div className="form-group">
                <label className="form-label">Request Title <span className="required">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Seeking SaaS Business in Ontario"
                  value={formData.title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  maxLength={120}
                />
                <div className="form-hint">{formData.title.length}/120 characters</div>
              </div>
              <div className="form-group">
                <label className="form-label">Description <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what you're looking for in detail..."
                  value={formData.description}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  rows={5}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select
                    className="form-select"
                    value={formData.industry}
                    onChange={e => handleFieldChange('industry', e.target.value)}
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Location</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Toronto, Ontario"
                    value={formData.location_preference}
                    onChange={e => handleFieldChange('location_preference', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Timeline</label>
                <select
                  className="form-select"
                  value={formData.timeline}
                  onChange={e => handleFieldChange('timeline', e.target.value)}
                >
                  <option value="">Select Timeline</option>
                  <option value="Immediately">Immediately</option>
                  <option value="Within 30 Days">Within 30 Days</option>
                  <option value="Within 90 Days">Within 90 Days</option>
                  <option value="Within 6 Months">Within 6 Months</option>
                  <option value="Within 12 Months">Within 12 Months</option>
                  <option value="No Rush">No Rush</option>
                </select>
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>{typeConfig.label} Details</h3>
              {typeConfig.fields.map(field => (
                <div className="form-group" key={field.name}>
                  <label className="form-label">{field.label}</label>
                  {field.type === 'text' && (
                    <input
                      className="form-input"
                      placeholder={field.placeholder || ''}
                      value={dynamicFields[field.name] || ''}
                      onChange={e => handleDynamicChange(field.name, e.target.value)}
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      className="form-input"
                      placeholder={field.placeholder || ''}
                      value={dynamicFields[field.name] || ''}
                      onChange={e => handleDynamicChange(field.name, e.target.value)}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      className="form-textarea"
                      placeholder={field.placeholder || ''}
                      value={dynamicFields[field.name] || ''}
                      onChange={e => handleDynamicChange(field.name, e.target.value)}
                      rows={3}
                    />
                  )}
                  {field.type === 'select' && (
                    <select
                      className="form-select"
                      value={dynamicFields[field.name] || ''}
                      onChange={e => handleDynamicChange(field.name, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {field.useIndustries
                        ? INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)
                        : field.options?.map(o => <option key={o} value={o}>{o}</option>)
                      }
                    </select>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.stepActions}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button
                className="btn btn-primary btn-lg"
                disabled={!canProceedToStep3()}
                onClick={() => setStep(3)}
              >
                Review Request
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && typeConfig && (
          <div className={styles.stepContent}>
            <h2 className={styles.sectionTitle}>Review Your Request</h2>

            {/* Preview Card */}
            <div className={styles.previewCard}>
              <div className={styles.previewBadge} style={{ '--type-color': typeConfig.color }}>
                {typeConfig.icon} {typeConfig.label}
              </div>
              <h3 className={styles.previewTitle}>{formData.title}</h3>
              <p className={styles.previewDesc}>{formData.description}</p>
              <div className={styles.previewMeta}>
                {formData.industry && <span>🏢 {formData.industry}</span>}
                {formData.location_preference && <span>📍 {formData.location_preference}</span>}
                {formData.timeline && <span>⏰ {formData.timeline}</span>}
              </div>
              {Object.entries(dynamicFields).filter(([, v]) => v).length > 0 && (
                <div className={styles.previewDynamic}>
                  <h4>Additional Details</h4>
                  {Object.entries(dynamicFields).filter(([, v]) => v).map(([key, val]) => {
                    const fieldConfig = typeConfig.fields.find(f => f.name === key);
                    return (
                      <div key={key} className={styles.previewField}>
                        <span className={styles.previewFieldLabel}>{fieldConfig?.label || key}:</span>
                        <span>{typeof val === 'number' ? `$${Number(val).toLocaleString()}` : val}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Keyword Warning */}
            {flaggedKeywords.length > 0 && (
              <div className={styles.warningBanner}>
                <div className={styles.warningIcon}>🚫</div>
                <div>
                  <strong>Cannot submit — prohibited language found:</strong>
                  <p className={styles.flaggedWords}>{flaggedKeywords.join(', ')}</p>
                  <p className={styles.warningNote}>Go back and remove these terms to proceed.</p>
                </div>
              </div>
            )}

            {/* Compliance Checkbox */}
            <div className={styles.complianceBox}>
              <label className={styles.complianceLabel}>
                <input
                  type="checkbox"
                  checked={complianceAccepted}
                  onChange={e => setComplianceAccepted(e.target.checked)}
                  className={styles.complianceCheck}
                />
                <span>{COMPLIANCE_CHECKBOX_TEXT}</span>
              </label>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.stepActions}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back to Edit</button>
              <button
                className="btn btn-primary btn-lg"
                disabled={!complianceAccepted || flaggedKeywords.length > 0 || submitting}
                onClick={handleSubmit}
              >
                {submitting ? <span className="spinner"></span> : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
