'use client';

import { useState } from 'react';
import SEOHero from '@/components/seo/SEOHero';
import styles from './Scorecard.module.css';
import { submitScorecardLead } from './actions';
import Link from 'next/link';

const QUESTIONS = [
  {
    id: 'financials',
    label: 'Financial Records & Bookkeeping',
    icon: '📊',
    question: 'How organized and reliable are your company\'s financial records?',
    description: 'Buyers demand verification. The quality of your bookkeeping directly impacts trust, due diligence speed, and valuation multiples.',
    options: [
      { text: 'Poor / Incomplete: Mostly tax returns, no formal financial statements', score: 1 },
      { text: 'Basic: In-house books on QuickBooks, but not reviewed by a CPA', score: 2 },
      { text: 'Good: Clean, up-to-date CPA-reviewed or compiled financial statements (Notice to Reader)', score: 3 },
      { text: 'Excellent: CPA-audited or reviewed statements with clear add-backs/SDE adjustments tracked', score: 4 }
    ]
  },
  {
    id: 'dependency',
    label: 'Owner Dependency & Operations',
    icon: '👥',
    question: 'If you took a 3-month vacation, what would happen to your business?',
    description: 'A business that cannot run without its owner is a job, not an asset. Reducing owner dependency dramatically increases transferability and value.',
    options: [
      { text: 'It would collapse: I make all daily operational and sales decisions', score: 1 },
      { text: 'It would struggle: Key staff can handle basics, but critical decisions would stall', score: 2 },
      { text: 'It would run fine: Standard operating procedures (SOPs) exist and team manages daily operations', score: 3 },
      { text: 'It would thrive: Complete management team is fully autonomous and operates without me', score: 4 }
    ]
  },
  {
    id: 'concentration',
    label: 'Customer Concentration Risk',
    icon: '🎯',
    question: 'How much of your annual revenue comes from your single largest customer?',
    description: 'High customer concentration is one of the biggest deal-killers. Buyers fear that the departure of one client will destroy the business.',
    options: [
      { text: 'Extremely high: A single customer accounts for more than 40% of revenue', score: 1 },
      { text: 'High: Largest customer is 20% to 40% of revenue', score: 2 },
      { text: 'Moderate: Largest customer is 10% to 20% of revenue', score: 3 },
      { text: 'Low / Diversified: No single customer accounts for more than 10% of revenue', score: 4 }
    ]
  },
  {
    id: 'growth',
    label: 'Growth & Profit Trends',
    icon: '📈',
    question: 'What has your revenue and profit trend looked like over the past 3 years?',
    description: 'Buyers pay a premium for forward momentum. A growing business reduces their risk and justifies a higher valuation multiple.',
    options: [
      { text: 'Declining: Both revenue and profit are shrinking', score: 1 },
      { text: 'Flat / Stagnant: Revenue and profits have remained relatively flat', score: 2 },
      { text: 'Consistent Growth: Steady, predictable growth of 5% to 15% per year', score: 3 },
      { text: 'Rapid Scale: Accelerating growth (>15% per year) with improving profit margins', score: 4 }
    ]
  },
  {
    id: 'team',
    label: 'Team & Key Employees',
    icon: '👔',
    question: 'What is the status of your key employees and their retention?',
    description: 'Having capable, loyal staff who will stay after the sale is critical for a smooth transition and operational continuity.',
    options: [
      { text: 'High turnover: No key staff, or high turnover in critical roles', score: 1 },
      { text: 'Sole-operator / Low support: Only have administrative staff; all key work is on me', score: 2 },
      { text: 'Stable team: Key employees have been with the company 2+ years, but no formal employment contracts', score: 3 },
      { text: 'Excellent retention: Key management locked in with formal contracts, non-competes, and clear incentives', score: 4 }
    ]
  },
  {
    id: 'legal',
    label: 'Legal & Compliance Readiness',
    icon: '⚖️',
    question: 'Are your legal documents, contracts, leases, and permits in order?',
    description: 'Messy contracts, expired leases, or regulatory disputes can derail a deal in due diligence. Clean legal records ensure assignability.',
    options: [
      { text: 'Messy: Missing vendor contracts, expired leases, or unresolved disputes', score: 1 },
      { text: 'Partial: Leases and key customer contracts are verbal or expired, but no major issues', score: 2 },
      { text: 'Good: All corporate records, customer contracts, and property leases are active and documented', score: 3 },
      { text: 'Audit-ready: Everything fully documented, easily transferable, with clear assignability clauses in all leases and major contracts', score: 4 }
    ]
  }
];

export default function ScorecardClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Lead form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSelectOption = (questionId, score) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentStep(0);
    setShowResults(false);
    setSubmitSuccess(false);
    setName('');
    setEmail('');
    setPhone('');
    setCompanyName('');
  };

  // Calculate score
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const maxScore = QUESTIONS.length * 4;
  const scorePercentage = showResults ? Math.round((totalScore / maxScore) * 100) : 0;

  // Get rating details
  const getRatingDetails = (pct) => {
    if (pct >= 85) {
      return {
        label: 'Highly Prepared (Exit Ready)',
        className: styles.ratingExitReady,
        color: '#065f46',
        desc: 'Your business is highly attractive to prospective buyers. You have minimized risks, established clean records, and built a transferable company that can command a premium multiple.',
        recommendations: [
          'Initiate a professional business valuation to establish an accurate and defensible asking price.',
          'Prepare a Confidential Information Memorandum (CIM) with a broker or advisor to package your business for market.',
          'Pre-qualify key financing options for buyers to accelerate the eventual transaction timeline.'
        ]
      };
    } else if (pct >= 70) {
      return {
        label: 'Well Prepared (Almost Ready)',
        className: styles.ratingAlmostReady,
        color: '#92400e',
        desc: 'You have done solid foundational work. Your business is in a good position, but a few key structural improvements can push you into premium multiple territory and ensure a smoother deal.',
        recommendations: [
          'Work on documenting all operational procedures into formal Standard Operating Procedures (SOPs).',
          'Strengthen agreements with key employees by offering retention incentives or formal employment contracts.',
          'Review customer contracts and property leases to ensure assignability and transferability clauses are clear.'
        ]
      };
    } else if (pct >= 50) {
      return {
        label: 'Partially Prepared (Getting There)',
        className: styles.ratingGettingThere,
        color: '#9a3412',
        desc: 'Your business has clear value, but it is currently highly dependent on your personal effort or carries operational risks that will cause buyers to discount their offers or request heavy earn-outs.',
        recommendations: [
          'Delegate day-to-day operations and decision-making to key staff to prove the business can run without you.',
          'Engage a CPA to compile formal, clean financial statements (Notice to Reader) for the past 2-3 years.',
          'Identify and actively work to reduce high customer concentration by diversifying your client base.'
        ]
      };
    } else {
      return {
        label: 'Low Preparedness (Not Ready)',
        className: styles.ratingNotReady,
        color: '#991b1b',
        desc: 'Your business requires significant restructuring before it is ready for a successful sale. Attempting to sell now is likely to result in failed due diligence, extremely low offers, or a deal that falls apart.',
        recommendations: [
          'Immediately move accounting out of simple spreadsheets and into CPA-supported, organized bookkeeping.',
          'Identify the critical roles you personally play and start hiring or training managers to take over those tasks.',
          'Clean up all corporate registries, expired vendor agreements, and resolve any outstanding compliance issues.'
        ]
      };
    }
  };

  const rating = getRatingDetails(scorePercentage);
  const currentQuestion = QUESTIONS[currentStep];
  const isOptionSelected = answers[currentQuestion.id] !== undefined;
  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setIsSubmitting(true);
    try {
      const result = await submitScorecardLead({
        name,
        email,
        phone,
        companyName,
        score: `${totalScore}/${maxScore}`,
        rating: rating.label,
        scorePercentage: `${scorePercentage}%`
      });

      if (result.success) {
        setSubmitSuccess(true);
      }
    } catch (err) {
      console.error('Failed submitting lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <SEOHero 
        title="Exit Readiness Scorecard" 
        intro="Assess whether your business is prepared for a successful, high-value transition. Identify operational risks, package your assets, and maximize your final sale price."
      />

      <div className={styles.scorecardContainer}>
        {!showResults ? (
          <div>
            {/* Progress Bar */}
            <div className={styles.progressWrapper}>
              <div className={styles.progressInfo}>
                <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className={styles.stepCard}>
              <div className={styles.stepIcon}>{currentQuestion.icon}</div>
              <div className={styles.stepLabel}>{currentQuestion.label}</div>
              <h2 className={styles.stepQuestion}>{currentQuestion.question}</h2>
              <p className={styles.stepDescription}>{currentQuestion.description}</p>

              <div className={styles.optionsGrid}>
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestion.id] === opt.score;
                  return (
                    <div
                      key={idx}
                      className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.score)}
                    >
                      <div className={`${styles.optionRadio} ${isSelected ? styles.optionRadioSelected : ''}`} />
                      <span className={styles.optionText}>{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.stepNav}>
                <button 
                  onClick={handleBack} 
                  className={styles.navBack}
                  style={{ opacity: currentStep === 0 ? 0.3 : 1, cursor: currentStep === 0 ? 'default' : 'pointer' }}
                  disabled={currentStep === 0}
                >
                  ← Back
                </button>
                <div className={styles.navSpacer} />
                <button
                  onClick={handleNext}
                  className={styles.navNext}
                  disabled={!isOptionSelected}
                >
                  {currentStep === QUESTIONS.length - 1 ? 'See My Scorecard' : 'Next Question →'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.resultsWrapper}>
            <div className={styles.resultsCard}>
              <h2 className={styles.resultsTitle}>Your Exit Readiness Results</h2>
              <p className={styles.resultsSubtitle}>Based on your answers, here is our assessment of your business transition readiness:</p>

              {/* Gauge Meter */}
              <div className={styles.gaugeContainer}>
                <div 
                  className={styles.gaugeOuter} 
                  style={{ 
                    '--gauge-pct': scorePercentage, 
                    '--gauge-color': rating.color 
                  }}
                >
                  <div className={styles.gaugeInner}>
                    <span className={styles.gaugeScore}>{scorePercentage}%</span>
                    <span className={styles.gaugeUnit}>Score</span>
                  </div>
                </div>
                <div className={`${styles.ratingBadge} ${rating.className}`}>
                  {rating.label}
                </div>
              </div>

              <p className={styles.resultsSubtitle} style={{ fontWeight: 500, fontSize: '1.1rem', maxWidth: 640, margin: '0 auto 30px', color: '#1f2937' }}>
                {rating.desc}
              </p>

              {/* Recommendations */}
              <div className={styles.recommendationsSection}>
                <h3 className={styles.recommendationsTitle}>Tailored Preparation Steps:</h3>
                <ul className={styles.recommendationsList}>
                  {rating.recommendations.map((rec, idx) => (
                    <li key={idx} className={styles.recommendationItem}>
                      <div className={styles.recommendationIcon}>✓</div>
                      <div className={styles.recommendationText}>{rec}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lead Capture */}
              <div className={styles.leadCapture}>
                <h3>Get Your Full Strategic Readiness Report</h3>
                <p className={styles.leadCaptureSubtitle}>Enter your details below to receive a detailed PDF roadmap outlining exactly how to prepare your business for a high-value sale.</p>
                
                {submitSuccess ? (
                  <div className={styles.successMessage}>
                    🎉 Thank you! Your strategic readiness roadmap has been sent to your email. An advisor will reach out shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className={styles.leadForm}>
                    <div className={styles.leadGrid}>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.leadGrid}>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Company Name (Optional)"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className={styles.navNext}
                      style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Generating Report...' : 'Get Full Strategic PDF Report'}
                    </button>
                  </form>
                )}
              </div>

              {/* CTA Section */}
              <div className={styles.ctaSection}>
                <h3 className={styles.ctaTitle}>Accelerate Your Sellability</h3>
                <p className={styles.ctaSubtitle}>Ready to take the next step towards selling? Explore Dealio Marketplace resources:</p>
                <div className={styles.ctaButtons}>
                  <Link href="/business-valuation-calculator" className={styles.navBack} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                    Calculate Business Value
                  </Link>
                  <Link href="/sell-my-business/canada" className={styles.navNext}>
                    List Your Business
                  </Link>
                </div>
                
                <button onClick={handleRetake} className={styles.retakeButton}>
                  🔄 Retake Scorecard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Copy Section */}
      <div className={styles.seoContent}>
        <section>
          <h2>Preparing Your Canadian Business for a High-Value Exit</h2>
          <p>
            Selling a business in Canada is a complex process that requires meticulous preparation, financial alignment, and operational independence. 
            Unfortunately, many business owners wait until they are ready to retire or burnt out before thinking about exit strategy. By then, the lack of organization, 
            heavy owner dependency, and high customer concentration can severely discount the business value or make it unsellable.
          </p>
          <p>
            Whether your business is located in Ontario, British Columbia, Alberta, or elsewhere across Canada, our Exit Readiness Scorecard 
            provides a clear roadmap. By evaluating core pillars of sellability, you can proactively address vulnerabilities and ensure you command a premium multiple.
          </p>
        </section>

        <section className={styles.faqSection}>
          <h2>Exit Readiness Frequently Asked Questions</h2>
          
          <div className={styles.faqItem}>
            <h4>How do I increase the value of my business before a sale?</h4>
            <p>
              To maximize value, focus on three primary pillars: 
              1) **Financial Clarity**: Have CPA-compiled statements with transparent add-backs; 
              2) **Systemization**: Document Standard Operating Procedures so the business operates without you; and 
              3) **Risk Mitigation**: Diversify your customer base and secure key employees with long-term contracts.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>What is customer concentration, and why is it dangerous?</h4>
            <p>
              Customer concentration occurs when a single customer represents more than 10% to 15% of your total revenue. 
              Buyers see this as an extreme risk because if that client leaves post-acquisition, the profitability of the business disappears. 
              Businesses with low customer concentration always command higher valuation multiples.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>How long does it take to prepare a business for sale?</h4>
            <p>
              Ideally, exit preparation should start 12 to 24 months before listing. 
              This timeline gives you sufficient time to clean up balance sheets, resolve pending disputes, transfer customer relationships to employees, 
              and optimize tax structuring (such as taking advantage of Canada's Lifetime Capital Gains Exemption - LCGE).
            </p>
          </div>
        </section>

        <section>
          <h2>Key Resources for Sellers</h2>
          <ul className={styles.linksList}>
            <li>
              <Link href="/business-valuation-calculator">Free Online Business Valuation Calculator</Link>
            </li>
            <li>
              <Link href="/sell-my-business/canada">Step-by-Step Guide to Selling a Business in Canada</Link>
            </li>
            <li>
              <Link href="/pricing">Seller Pricing and Packages on Dealio Marketplace</Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
