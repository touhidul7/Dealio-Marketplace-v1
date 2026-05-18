export default function FAQSection({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div style={{ marginTop: '60px' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '30px' }}>Frequently Asked Questions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{faq.question}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
