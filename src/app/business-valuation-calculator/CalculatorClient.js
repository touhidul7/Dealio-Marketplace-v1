'use client';

import { useState } from 'react';
import Link from 'next/link';
import SEOHero from '@/components/seo/SEOHero';
import { useAuth } from '@/components/AuthProvider';
import { submitValuationLead } from './actions';
import styles from './Calculator.module.css';

const INDUSTRIES_MULTIPLES = {
  'SaaS': [3.5, 6.0],
  'E-commerce': [2.0, 4.0],
  'Shopify Store': [2.0, 4.0],
  'HVAC': [2.5, 4.5],
  'Plumbing': [2.5, 4.5],
  'Electrical': [2.5, 4.5],
  'Cleaning Services': [2.0, 3.5],
  'Manufacturing': [3.0, 5.0],
  'Dental Practice': [3.0, 5.0],
  'Physiotherapy Clinic': [2.5, 4.5],
  'Med Spa': [2.0, 4.0],
  'Restaurant / Food Service': [1.5, 3.0],
  'Landscaping': [2.0, 3.5],
  'Auto Repair': [2.0, 3.5],
  'Accounting Firm': [2.5, 4.5],
  'Law Firm': [2.0, 4.0],
  'Childcare Centre': [2.5, 4.5],
  'Senior Care': [2.5, 4.5],
  'Franchise': [2.0, 4.0],
  'Distribution': [2.5, 4.5],
  'Convenience Store': [1.5, 3.0],
  'Gas Station': [1.5, 3.0],
  'Fitness Studio': [1.5, 3.0],
  'Construction': [2.0, 3.5],
  'Digital Business': [2.0, 4.0],
  'Personal Care & Spas': [1.5, 3.0],
  'Pet Services & Supplies': [1.8, 3.5],
  'Business Services & B2B': [2.0, 4.0],
  'Logistics & Warehousing': [2.5, 4.5],
  'Waste Management & Recycling': [3.0, 5.5],
  'Leisure, Recreation & Tourism': [1.8, 3.5],
  'Other': [2.0, 3.5]
};

const PROVINCES = [
  'Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba',
  'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador',
  'Prince Edward Island', 'Yukon', 'Northwest Territories', 'Nunavut'
];

export default function CalculatorClient() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    industry: '',
    annualRevenue: '',
    annualEarnings: '',
    province: '',
    growthTrend: 'Stable',
    ownerInvolvement: 'Owner-operated full time',
    recurringRevenue: 'None',
    customerConcentration: 'Low concentration',
    realEstateIncluded: 'No',
    sellerFinancing: 'No'
  });

  const [result, setResult] = useState(null);
  
  // Lead capture state
  const [leadData, setLeadData] = useState({
    name: '', email: '', phone: '', companyName: ''
  });
  const [leadStatus, setLeadStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    setLeadData(prev => ({ ...prev, [name]: value }));
  };

  const calculateValuation = (e) => {
    e.preventDefault();
    
    if (!formData.industry || !formData.annualEarnings) {
      alert("Please select an industry and enter annual earnings.");
      return;
    }

    const earnings = parseFloat(formData.annualEarnings) || 0;
    if (earnings <= 0) {
      alert("Annual earnings must be greater than 0 to calculate a multiple-based valuation.");
      return;
    }

    const baseMultiples = INDUSTRIES_MULTIPLES[formData.industry] || [2.0, 3.5];
    let lowMult = baseMultiples[0];
    let highMult = baseMultiples[1];

    // Adjustment rules
    let adjustment = 0;
    if (formData.growthTrend === 'Declining') adjustment -= 0.5;
    if (formData.growthTrend === 'Growing slowly') adjustment += 0.25;
    if (formData.growthTrend === 'Growing quickly') adjustment += 0.5;

    if (formData.ownerInvolvement === 'Owner-operated full time') adjustment -= 0.25;
    if (formData.ownerInvolvement === 'Manager-run') adjustment += 0.25;
    if (formData.ownerInvolvement === 'Absentee owner') adjustment += 0.5;

    if (formData.recurringRevenue === 'Some recurring revenue') adjustment += 0.25;
    if (formData.recurringRevenue === 'Mostly recurring revenue') adjustment += 0.5;

    if (formData.customerConcentration === 'Moderate concentration') adjustment -= 0.25;
    if (formData.customerConcentration === 'High concentration') adjustment -= 0.5;

    if (formData.sellerFinancing === 'Yes' || formData.sellerFinancing === 'Open to discussion') adjustment += 0.25;

    lowMult = Math.max(0.5, lowMult + adjustment);
    highMult = Math.max(0.5, highMult + adjustment);

    const estimatedLow = earnings * lowMult;
    const estimatedHigh = earnings * highMult;

    setResult({
      lowValuation: estimatedLow,
      highValuation: estimatedHigh,
      lowMult: lowMult.toFixed(2),
      highMult: highMult.toFixed(2)
    });
    
    // reset lead form if they calculate again
    setLeadStatus('');
  };

  const submitLead = async (e) => {
    e.preventDefault();
    setLeadStatus('submitting');
    
    try {
      await submitValuationLead({
        ...leadData,
        industry: formData.industry,
        province: formData.province,
        annualRevenue: formData.annualRevenue,
        annualEarnings: formData.annualEarnings,
        valuationLow: result.lowValuation,
        valuationHigh: result.highValuation
      });
      setLeadStatus('success');
    } catch (err) {
      console.error(err);
      setLeadStatus('error');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className={styles.wrapper}>
      <SEOHero 
        title="Estimate What Your Business Could Be Worth" 
        intro="Use Dealio’s business valuation calculator to get a rough valuation range based on your revenue, earnings, industry, growth profile, and owner involvement."
      />

      <div className="container">
        <div className={styles.disclaimerTop}>
          <p><strong>Important:</strong> This calculator provides a rough educational estimate only. It is not a formal valuation, appraisal, accounting opinion, tax advice, legal advice, financial advice, or investment advice.</p>
        </div>

        <div className={styles.calculatorSection}>
          <form className={styles.calcForm} onSubmit={calculateValuation}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label>Industry *</label>
                <select name="industry" value={formData.industry} onChange={handleInputChange} required>
                  <option value="">Select Industry</option>
                  {Object.keys(INDUSTRIES_MULTIPLES).map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label>Province</label>
                <select name="province" value={formData.province} onChange={handleInputChange}>
                  <option value="">Select Province</option>
                  {PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label>Annual Revenue ($)</label>
                <input type="number" name="annualRevenue" value={formData.annualRevenue} onChange={handleInputChange} min="0" placeholder="e.g. 1000000" />
              </div>

              <div className={styles.fieldGroup}>
                <label>Annual SDE or EBITDA ($) *</label>
                <input type="number" name="annualEarnings" value={formData.annualEarnings} onChange={handleInputChange} required min="1" placeholder="e.g. 250000" />
              </div>

              <div className={styles.fieldGroup}>
                <label>Growth Trend</label>
                <select name="growthTrend" value={formData.growthTrend} onChange={handleInputChange}>
                  <option>Declining</option>
                  <option>Stable</option>
                  <option>Growing slowly</option>
                  <option>Growing quickly</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label>Owner Involvement</label>
                <select name="ownerInvolvement" value={formData.ownerInvolvement} onChange={handleInputChange}>
                  <option>Owner-operated full time</option>
                  <option>Owner-operated part time</option>
                  <option>Manager-run</option>
                  <option>Absentee owner</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label>Recurring Revenue (Optional)</label>
                <select name="recurringRevenue" value={formData.recurringRevenue} onChange={handleInputChange}>
                  <option>None</option>
                  <option>Some recurring revenue</option>
                  <option>Mostly recurring revenue</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label>Customer Concentration (Optional)</label>
                <select name="customerConcentration" value={formData.customerConcentration} onChange={handleInputChange}>
                  <option>Low concentration</option>
                  <option>Moderate concentration</option>
                  <option>High concentration</option>
                </select>
              </div>
              
              <div className={styles.fieldGroup}>
                <label>Seller Financing Available (Optional)</label>
                <select name="sellerFinancing" value={formData.sellerFinancing} onChange={handleInputChange}>
                  <option>No</option>
                  <option>Yes</option>
                  <option>Open to discussion</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className="btn btn-primary btn-lg">Calculate My Business Value</button>
              <Link href="/seller/listings/new" className="btn btn-outline btn-lg">List My Business</Link>
            </div>
          </form>

          {result && (
            <div className={styles.resultContainer}>
              <h2 className={styles.resultTitle}>Estimated Valuation Range</h2>
              <div className={styles.resultNumbers}>
                {formatCurrency(result.lowValuation)} – {formatCurrency(result.highValuation)}
              </div>
              <p className={styles.resultMultiple}>Based on an estimated {result.lowMult}x – {result.highMult}x earnings multiple.</p>
              
              <div className={styles.resultContext}>
                <p><strong>Revenue context:</strong> This estimate is based primarily on earnings. Revenue, growth, industry, transferability, recurring revenue, and buyer demand may affect the final market value.</p>
                <p><strong>Disclaimer:</strong> This is a rough educational estimate only. Actual valuation depends on detailed financials, add-backs, working capital, assets, liabilities, buyer demand, deal structure, tax treatment, and due diligence.</p>
              </div>

              <div className={styles.resultCta}>
                <h3>Want a more accurate view of your business value?</h3>
                <p>Create a seller profile, list your business confidentially, or request advisory support from Dealio.</p>
                <div className={styles.resultCtaButtons}>
                  <Link href="/signup?role=seller" className="btn btn-primary">Create Seller Profile →</Link>
                  <Link href="/seller/listings/new" className="btn btn-outline">List My Business →</Link>
                  <Link href="/pricing" className="btn btn-outline">View Pricing</Link>
                </div>
              </div>

              {!user && (
                <div className={styles.leadCapture}>
                  <h3>Get a copy & next steps</h3>
                  {leadStatus === 'success' ? (
                    <div className={styles.successMessage}>Thank you! We've received your request and will be in touch shortly.</div>
                  ) : (
                    <form onSubmit={submitLead} className={styles.leadForm}>
                      <div className={styles.leadGrid}>
                        <input type="text" name="name" placeholder="Your Name" required value={leadData.name} onChange={handleLeadChange} />
                        <input type="email" name="email" placeholder="Your Email" required value={leadData.email} onChange={handleLeadChange} />
                        <input type="tel" name="phone" placeholder="Phone (Optional)" value={leadData.phone} onChange={handleLeadChange} />
                        <input type="text" name="companyName" placeholder="Company Name (Optional)" value={leadData.companyName} onChange={handleLeadChange} />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={leadStatus === 'submitting'}>
                        {leadStatus === 'submitting' ? 'Sending...' : 'Send My Valuation Estimate'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.seoContent}>
          <section>
            <h2>How Dealio estimates business value</h2>
            <p>Many small business valuations are based on earnings multiples, adjusted by industry, growth, owner involvement, recurring revenue, customer concentration, and deal structure. Our calculator uses typical industry benchmarks to give you a foundational understanding of what buyers might pay.</p>
          </section>

          <section>
            <h2>What affects the value of a Canadian small business?</h2>
            <ul className={styles.factorsList}>
              <li><strong>Revenue and earnings quality:</strong> Consistent, verifiable income increases buyer confidence.</li>
              <li><strong>SDE or EBITDA:</strong> The true discretionary cash flow available to an owner.</li>
              <li><strong>Industry demand:</strong> Essential services often command higher multiples than niche retail.</li>
              <li><strong>Growth trend:</strong> A growing business is more attractive than one in decline.</li>
              <li><strong>Owner dependence:</strong> Businesses with management teams sell for more than owner-reliant operations.</li>
              <li><strong>Recurring revenue:</strong> Subscriptions or contracts offer predictable cash flow.</li>
              <li><strong>Customer concentration:</strong> Relying on one large client poses a risk to buyers.</li>
              <li><strong>Assets and working capital:</strong> Included equipment and inventory add tangible value.</li>
              <li><strong>Seller financing:</strong> Offering terms can bridge valuation gaps and increase the final price.</li>
              <li><strong>Location and buyer demand:</strong> Prime locations in active markets fetch premiums.</li>
            </ul>
          </section>

          <section>
            <h2>When should you get a deeper valuation review?</h2>
            <p>Owners should get a deeper valuation review before listing, speaking with buyers, negotiating price, or preparing confidential materials. A professional broker or advisor will examine your add-backs, analyze comparable sales, and structure the offering to maximize value.</p>
          </section>

          <section>
            <h2>Next steps after estimating your business value</h2>
            <p>Ready to take the next step? Explore our resources:</p>
            <ul className={styles.linksList}>
              <li><Link href="/sell-my-business/canada">Sell a Business in Canada</Link></li>
              <li><Link href="/pricing">View Listing Pricing</Link></li>
              <li><Link href="/listings">Browse Current Listings</Link></li>
              <li><Link href="/confidential-listings">View Confidential Listings</Link></li>
              <li><Link href="/seller-financing-available">Businesses with Seller Financing</Link></li>
            </ul>
          </section>

          <section className={styles.faqSection}>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqItem}>
              <h4>How accurate is this business valuation calculator?</h4>
              <p>It provides a rough educational estimate only. A formal valuation requires detailed financials, add-backs, assets, liabilities, working capital, market demand, and deal structure review.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>What is SDE?</h4>
              <p>Seller discretionary earnings represent the financial benefit available to one owner-operator after adjusting for certain owner-related or discretionary expenses.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>What is EBITDA?</h4>
              <p>EBITDA means earnings before interest, taxes, depreciation, and amortization. It is often used to compare operating performance across businesses.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>What multiple should I use to value my business?</h4>
              <p>The multiple depends on industry, size, profitability, growth, transferability, recurring revenue, customer concentration, and buyer demand.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>Can I list my business after using the calculator?</h4>
              <p>Yes. After estimating a rough value, owners can create a seller profile and list their business on Dealio Marketplace.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
