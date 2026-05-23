'use client';

import { useState } from 'react';
import SEOHero from '@/components/seo/SEOHero';
import styles from './ProfileBuilder.module.css';
import { submitBuyerProfile } from './actions';
import Link from 'next/link';

const BUYER_TYPES = [
  { id: 'Individual', label: 'Individual Operator', emoji: '💼' },
  { id: 'Search Fund', label: 'Search Fund / ETA', emoji: '🚀' },
  { id: 'PE / Family Office', label: 'PE / Family Office', emoji: '🏛️' },
  { id: 'Strategic Acquirer', label: 'Strategic Acquirer', emoji: '🏢' },
  { id: 'Operator', label: 'Existing Owner / Operator', emoji: '🔧' },
  { id: 'Investor', label: 'Financial Investor', emoji: '📈' }
];

const INDUSTRIES = [
  { id: 'HVAC', label: 'HVAC & Plumbing', emoji: '💨' },
  { id: 'Cleaning', label: 'Commercial Cleaning', emoji: '🧹' },
  { id: 'Restaurants', label: 'Restaurants & Hospitality', emoji: '🍔' },
  { id: 'Dental', label: 'Dental & Medical', emoji: '🦷' },
  { id: 'Manufacturing', label: 'Manufacturing & Industrial', emoji: '🏭' },
  { id: 'Landscaping', label: 'Landscaping & Greenery', emoji: '🌳' },
  { id: 'SaaS', label: 'SaaS & Tech', emoji: '💻' },
  { id: 'Ecommerce', label: 'E-commerce', emoji: '🛒' },
  { id: 'Retail', label: 'Retail & Consumer', emoji: '🛍️' },
  { id: 'Construction', label: 'Construction & Trades', emoji: '🔨' },
  { id: 'Distribution', label: 'Distribution & Logistics', emoji: '📦' },
  { id: 'Professional Services', label: 'Professional Services', emoji: '🤝' }
];

const BUDGET_RANGES = [
  'Under $250k',
  '$250k - $500k',
  '$500k - $1M',
  '$1M - $2M',
  '$2M+'
];

const PROVINCES = [
  { id: 'Ontario', label: 'Ontario', emoji: '🍁' },
  { id: 'BC', label: 'British Columbia', emoji: '🏔️' },
  { id: 'Alberta', label: 'Alberta', emoji: '🤠' },
  { id: 'Quebec', label: 'Quebec', emoji: '⚜️' },
  { id: 'Saskatchewan', label: 'Saskatchewan', emoji: '🌾' },
  { id: 'Manitoba', label: 'Manitoba', emoji: '🦬' },
  { id: 'Nova Scotia', label: 'Nova Scotia', emoji: '⚓' },
  { id: 'New Brunswick', label: 'New Brunswick', emoji: '🌲' },
  { id: 'PEI', label: 'Prince Edward Island', emoji: '🥔' },
  { id: 'Newfoundland', label: 'Newfoundland & Labrador', emoji: '🐕' }
];

const STEPS = [
  { label: 'Buyer Type' },
  { label: 'Industries' },
  { label: 'Deal Size' },
  { label: 'Locations' },
  { label: 'Details' }
];

export default function ProfileBuilderClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [shake, setShake] = useState(false);

  // Form Fields
  const [buyerType, setBuyerType] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [budgetRange, setBudgetRange] = useState('');
  const [revenueMin, setRevenueMin] = useState('');
  const [revenueMax, setRevenueMax] = useState('');
  const [ebitdaMin, setEbitdaMin] = useState('');
  const [ebitdaMax, setEbitdaMax] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [timeline, setTimeline] = useState('');
  const [fundsSource, setFundsSource] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 0 && !buyerType) {
      triggerShake();
      return;
    }
    if (currentStep === 1 && selectedIndustries.length === 0) {
      triggerShake();
      return;
    }
    if (currentStep === 2 && !budgetRange) {
      triggerShake();
      return;
    }
    if (currentStep === 3 && selectedLocations.length === 0) {
      triggerShake();
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleIndustry = (id) => {
    setSelectedIndustries(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleLocation = (id) => {
    setSelectedLocations(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !timeline || !fundsSource) {
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitBuyerProfile({
        name,
        email,
        phone,
        buyerType,
        industries: selectedIndustries,
        budgetRange,
        revenueRange: revenueMin || revenueMax ? `$${revenueMin || 0} - $${revenueMax || 'Max'}` : 'N/A',
        ebitdaRange: ebitdaMin || ebitdaMax ? `$${ebitdaMin || 0} - $${ebitdaMax || 'Max'}` : 'N/A',
        locations: selectedLocations,
        timeline,
        fundsSource,
        budgetMax: budgetRange === 'Under $250k' ? 250000 : budgetRange === '$250k - $500k' ? 500000 : budgetRange === '$500k - $1M' ? 1000000 : budgetRange === '$1M - $2M' ? 2000000 : 99999999,
        ebitdaMax: ebitdaMax ? parseInt(ebitdaMax, 10) : null
      });

      if (result.success) {
        setSubmitSuccess(true);
      }
    } catch (err) {
      console.error('Failed submitting buyer profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <SEOHero 
        title="Buyer Profile Builder" 
        intro="Build your ideal acquisition criteria, establish credibility, and receive exclusive access to matching Canadian businesses before they hit the open market."
      />

      <div className={styles.wizardContainer}>
        {!submitSuccess ? (
          <div>
            {/* Connected Progress Stepper */}
            <div className={styles.progressBar}>
              {STEPS.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx === STEPS.length - 1 ? 'none' : '1' }}>
                  <div className={`${styles.stepDot} ${idx === currentStep ? styles.active : ''} ${idx < currentStep ? styles.completed : ''}`}>
                    {idx + 1}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`${styles.stepLine} ${idx < currentStep ? styles.completed : ''}`} />
                  )}
                </div>
              ))}
            </div>
            <div className={styles.stepLabels}>
              {STEPS.map((step, idx) => (
                <div key={idx} className={`${styles.stepLabel} ${idx === currentStep ? styles.active : ''}`}>
                  {step.label}
                </div>
              ))}
            </div>

            {/* Stepper Card */}
            <form onSubmit={handleSubmit} className={`${styles.stepContent} ${shake ? styles.shake : ''}`} style={{ marginTop: '30px' }}>
              
              {/* STEP 1: Buyer Type */}
              {currentStep === 0 && (
                <div>
                  <h2 className={styles.stepTitle}>What type of buyer are you?</h2>
                  <p className={styles.stepSubtitle}>Select the option that best describes your profile. This helps us customize listings and outreach.</p>
                  
                  <div className={styles.cardsGrid}>
                    {BUYER_TYPES.map((type) => {
                      const isSelected = buyerType === type.id;
                      return (
                        <div
                          key={type.id}
                          className={`${styles.selectCard} ${isSelected ? styles.selected : ''}`}
                          onClick={() => setBuyerType(type.id)}
                        >
                          <span className={styles.cardIcon}>{type.emoji}</span>
                          <span className={styles.cardLabel}>{type.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Industries */}
              {currentStep === 1 && (
                <div>
                  <h2 className={styles.stepTitle}>Which industries are you interested in?</h2>
                  <p className={styles.stepSubtitle}>Select all sectors you are comfortable acquiring or running. Multi-select is encouraged.</p>
                  
                  <div className={styles.pillsContainer}>
                    {INDUSTRIES.map((ind) => {
                      const isSelected = selectedIndustries.includes(ind.id);
                      return (
                        <div
                          key={ind.id}
                          className={`${styles.pill} ${isSelected ? styles.selected : ''}`}
                          onClick={() => toggleIndustry(ind.id)}
                        >
                          <span className={styles.pillEmoji}>{ind.emoji}</span>
                          <span>{ind.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Deal Size Criteria */}
              {currentStep === 2 && (
                <div>
                  <h2 className={styles.stepTitle}>Define your target deal size</h2>
                  <p className={styles.stepSubtitle}>Select your ideal total budget range, and optionally specify your target revenue or EBITDA limits.</p>
                  
                  <div className={styles.criteriaSection}>
                    <span className={styles.criteriaLabel}>Ideal Total Budget (Purchase Price)</span>
                    <div className={styles.rangeCards}>
                      {BUDGET_RANGES.map((range) => {
                        const isSelected = budgetRange === range;
                        return (
                          <div
                            key={range}
                            className={`${styles.rangeCard} ${isSelected ? styles.selected : ''}`}
                            onClick={() => setBudgetRange(range)}
                          >
                            {range}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Minimum Annual Revenue (CAD)</label>
                      <input
                        type="number"
                        placeholder="e.g. $500,000"
                        className={styles.formInput}
                        value={revenueMin}
                        onChange={(e) => setRevenueMin(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Maximum Annual Revenue (CAD)</label>
                      <input
                        type="number"
                        placeholder="e.g. $5,000,000"
                        className={styles.formInput}
                        value={revenueMax}
                        onChange={(e) => setRevenueMax(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Minimum Annual EBITDA / SDE (CAD)</label>
                      <input
                        type="number"
                        placeholder="e.g. $100,000"
                        className={styles.formInput}
                        value={ebitdaMin}
                        onChange={(e) => setEbitdaMin(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Maximum Annual EBITDA / SDE (CAD)</label>
                      <input
                        type="number"
                        placeholder="e.g. $1,000,000"
                        className={styles.formInput}
                        value={ebitdaMax}
                        onChange={(e) => setEbitdaMax(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Locations */}
              {currentStep === 3 && (
                <div>
                  <h2 className={styles.stepTitle}>Where are you looking to acquire?</h2>
                  <p className={styles.stepSubtitle}>Select your preferred Canadian provinces. You can select multiple locations.</p>
                  
                  <div className={styles.provinceGrid}>
                    {PROVINCES.map((prov) => {
                      const isSelected = selectedLocations.includes(prov.id);
                      return (
                        <div
                          key={prov.id}
                          className={`${styles.provinceCard} ${isSelected ? styles.selected : ''}`}
                          onClick={() => toggleLocation(prov.id)}
                        >
                          <span className={styles.provinceEmoji}>{prov.emoji}</span>
                          <span>{prov.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Timeline & Contact Info */}
              {currentStep === 4 && (
                <div>
                  <h2 className={styles.stepTitle}>A few final details...</h2>
                  <p className={styles.stepSubtitle}>Provide your acquisition timeline, source of funds, and contact info to build your verified buyer profile.</p>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Acquisition Timeline</label>
                      <select
                        className={styles.formInput}
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        required
                      >
                        <option value="">Select timeline...</option>
                        <option value="Immediate">Immediate (Ready to buy now)</option>
                        <option value="Under 3 Months">Next 3 Months</option>
                        <option value="3-6 Months">Next 3-6 Months</option>
                        <option value="6-12 Months">Next 6-12 Months</option>
                        <option value="Just Exploring">Just Exploring / Monitoring</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Source of Acquisition Funds</label>
                      <select
                        className={styles.formInput}
                        value={fundsSource}
                        onChange={(e) => setFundsSource(e.target.value)}
                        required
                      >
                        <option value="">Select funding source...</option>
                        <option value="Cash + SBA/Bank">Equity/Cash + SBA or Bank Financing</option>
                        <option value="Private Equity">Private Equity / Syndicate</option>
                        <option value="Seller Financing">Seller Financing / VTB Preferred</option>
                        <option value="Rollover/Other">Equity Rollover / Other Assets</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className={styles.formInput}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formGroupLabel}>Email Address</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className={styles.formInput}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup, styles.fullWidth}>
                      <label className={styles.formGroupLabel}>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. (416) 555-0199"
                        className={styles.formInput}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className={styles.navButtons}>
                <button
                  type="button"
                  onClick={handleBack}
                  className={styles.backBtn}
                  style={{ opacity: currentStep === 0 ? 0.3 : 1, cursor: currentStep === 0 ? 'default' : 'pointer' }}
                  disabled={currentStep === 0}
                >
                  ← Back
                </button>
                
                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={styles.nextBtn}
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className={styles.spinner} />
                        <span>Verifying Profile...</span>
                      </>
                    ) : (
                      'Build Verified Profile'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* SUMMARY CARD ON SUCCESS */
          <div className={styles.summaryCard}>
            <div className={styles.summaryBadge}>✓ Verified Buyer Profile Created</div>
            <h2 className={styles.summaryTitle}>Your Profile is Live!</h2>
            <p className={styles.summarySubtitle}>Based on your preferences, Dealio Marketplace will automatically filter and recommend matching Canadian business opportunities.</p>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>Buyer Profile</div>
                <div className={styles.summaryItemValue}>{buyerType}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>Target Budget</div>
                <div className={styles.summaryItemValue}>{budgetRange}</div>
              </div>
              <div className={styles.summaryItem} style={{ gridColumn: '1 / -1' }}>
                <div className={styles.summaryItemLabel}>Target Industries</div>
                <div className={styles.summaryTags}>
                  {selectedIndustries.map((ind) => (
                    <span key={ind} className={styles.summaryTag}>
                      {INDUSTRIES.find(x => x.id === ind)?.emoji} {INDUSTRIES.find(x => x.id === ind)?.label || ind}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.summaryItem} style={{ gridColumn: '1 / -1' }}>
                <div className={styles.summaryItemLabel}>Preferred Locations</div>
                <div className={styles.summaryTags}>
                  {selectedLocations.map((loc) => (
                    <span key={loc} className={styles.summaryTag} style={{ background: '#fef3c7', color: '#92400e' }}>
                      {PROVINCES.find(x => x.id === loc)?.emoji} {PROVINCES.find(x => x.id === loc)?.label || loc}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>Timeline</div>
                <div className={styles.summaryItemValue}>{timeline}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>Acquisition Funds</div>
                <div className={styles.summaryItemValue}>{fundsSource}</div>
              </div>
            </div>

            <div className={styles.summaryCta}>
              <p>Next Steps: Instantly explore listings matching your profile or setup a buyer account to start communicating with sellers.</p>
              <div className={styles.summaryCtaButtons}>
                <Link href="/listings" className={styles.backBtn} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                  Browse Matching Listings
                </Link>
                <Link href="/signup?role=buyer" className={styles.nextBtn}>
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Copy Section */}
      <div className={styles.seoContent}>
        <section>
          <h2>Acquiring a Small-to-Medium Canadian Business</h2>
          <p>
            The market for buying businesses in Canada is undergoing an unprecedented shift. As thousands of baby boomer business owners retire 
            over the next decade, premium companies in service, manufacturing, medical, and trade sectors are seeking qualified, serious acquirers.
          </p>
          <p>
            However, finding the right deal is a challenge. Many high-quality deals are sold privately without ever reaching public MLS or business-for-sale websites. 
            By building a verified buyer profile on Dealio Marketplace, you position yourself as a structured buyer. This signals credibility to seller brokers, advisors, 
            and owners, ensuring you receive priority notifications for off-market deal flow.
          </p>
        </section>

        <section className={styles.faqSection}>
          <h2>Acquisition & Buyer Frequently Asked Questions</h2>

          <div className={styles.faqItem}>
            <h4>What are the steps to buy a business in Canada?</h4>
            <p>
              Buying a business typically involves: 
              1) **Preparation**: Defining your budget, industry, and location preferences; 
              2) **Deal Sourcing**: Searching platforms like Dealio and networking with brokers; 
              3) **NDA & Review**: Signing a Non-Disclosure Agreement to review the Confidential Information Memorandum (CIM); 
              4) **LOI**: Submitting a Letter of Intent outlining price and terms; 
              5) **Due Diligence**: Verifying tax, legal, and financial records; and 
              6) **Closing**: Drafting the asset/share purchase agreement and transitioning operations.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>How can I finance a business purchase in Canada?</h4>
            <p>
              Acquirers typically fund purchases through a mix of: 
              - **Buyer Equity**: Personal cash savings, representing 10% to 30% of the purchase price. 
              - **SBA / CSBF Loans**: The Canada Small Business Financing Program offers government-backed bank loans up to $1.15 million. 
              - **Vendor Take-Back (VTB)**: Seller financing where the seller carries a portion of the purchase price as a loan (usually 10% to 30%). 
              - **Bank term loans or equipment leases**.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>Why is a buyer profile essential?</h4>
            <p>
              Sellers and brokers protect business confidentiality fiercely. They will not share sensitive financial information with unverified prospects. 
              A comprehensive buyer profile outlines your target industry, available capital, operational experience, and timeline, proving you are a highly qualified buyer 
              who can execute a transaction smoothly.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
