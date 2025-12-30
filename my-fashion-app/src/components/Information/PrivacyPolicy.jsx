const styles = {
  container: {
    maxWidth: '1520px', 
    margin: '40px auto', 
    padding: '20px 40px', 
    fontFamily: 'sans-serif', 
    lineHeight: '1.6',
    color: '#000000ff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  mainTitle: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  lastUpdated: {
    color: '#666',
    fontSize: '0.9rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginTop: '40px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  list: {
    paddingLeft: '20px',
  },
  listItem: {
    marginBottom: '10px',
  },
  address: {
    fontStyle: 'normal',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
  }
};

export default function PrivacyPolicy() {
  const brandName = "Solid Design";
  const effectiveDate = "August 26, 2025";

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>Privacy Policy</h1>
        <p style={styles.lastUpdated}>Last updated: {effectiveDate}</p>
      </header>

      <section>
        <h2 style={styles.sectionTitle}>1. Introduction</h2>
        <p>
          Welcome to {brandName}. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, please contact us at contact@soliddesign.com.
        </p>
        <p>
          This privacy notice describes how we might use your information if you visit our website. We take your privacy very seriously and seek to explain in the clearest way possible what information we collect and how we use it.
        </p>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>2. What Information Do We Collect?</h2>
        <p>
          We collect personal information that you voluntarily provide to us when you register, place an order, or express an interest in our products. This may include:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}><strong>Personal Details:</strong> Name, email address, mailing address, and phone number.</li>
          <li style={styles.listItem}><strong>Payment Data:</strong> Credit card numbers and other payment details necessary to process your orders.</li>
        </ul>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>3. How Do We Use Your Information?</h2>
        <p>
          We use the information we collect for various business purposes, including:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>To fulfill and manage your orders, payments, and returns.</li>
          <li style={styles.listItem}>To send you marketing and promotional communications.</li>
          <li style={styles.listItem}>To request feedback and to contact you about your use of our Website.</li>
          <li style={styles.listItem}>To keep our Website safe and secure.</li>
        </ul>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>4. Will Your Information Be Shared?</h2>
        <p>
          We only share information with your consent, to comply with laws, or to fulfill business obligations with our trusted third-party service providers, such as payment processors and shipping companies.
        </p>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>5. How Can You Contact Us?</h2>
        <p>
          If you have questions or comments about this policy, you may email us at contact@{brandName.toLowerCase()}.com or by post to:
        </p>
        <address style={styles.address}>
          {brandName} Inc.<br />
          [Kandy]<br />
          [Sri Lanka]
        </address>
      </section>
    </div>
  );
}