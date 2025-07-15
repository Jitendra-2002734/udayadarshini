import React from "react";

const PrivacyPolicy = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Alpha Inspector &ndash; Privacy Policy</h1>
      <p style={styles.paragraph}><strong>Welcome to Alpha Inspector! Your privacy is important to us, and we want to be transparent about how we collect, use, and protect your data. This Privacy Policy explains how we handle your information when you use our app.</strong></p>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>1. Information We Collect</h2>
        <p style={{fontSize:'14px'}}>We collect only the data necessary for the app’s functionality:</p>

        <div>
          <strong >✅ Device Information</strong>
          <ul>
            <li style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> What we collect:</strong> Device model, OS version, and app version data.</li>
            <li style={{fontSize:'14px'}}><strong style={{fontSize:'15px'}}> Why we collect it:</strong> To improve app performance and ensure compatibility.</li>
          </ul>
        </div>

        <div>
          <strong>✅ Location Access</strong>
          <ul>
            <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> What we collect:</strong> Your real-time location is collected only when you are <strong>on duty.</strong> If you are <strong>off duty</strong>, your location is not updated.</li>
            <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Why we collect it:</strong> For movement tracking, reports, and security monitoring during duty hours.</li>
            <li style={{fontSize:'14px'}}><strong style={{fontSize:'15px',fontSize:'14px'}}> Your control:</strong > You can enable/disable location access anytime in your phone’s settings.</li>
          </ul>
        </div>

        <div>
          <strong>✅ Camera Access</strong>
          <ul>
            <li style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> What we collect:</strong> Photos taken within the app.</li>
            <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Why we collect it:</strong> To upload images for footplate inspections, ambush checks, and counseling.</li>
            <li style={{fontSize:'14px'}}><strong style={{fontSize:'15px'}}> Your control:</strong> You can allow/deny camera access in your phone’s settings.</li>
          </ul>
        </div>

        <div>
          <strong>✅ Gallery (Storage) Access</strong>
          <ul>
            <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> What we collect:</strong> Only the files you select, such as SPM documents and images required for inspections.</li>
            <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Why we collect it:</strong> To allow you to upload necessary documents.</li>
            <li style={{fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Your control:</strong>
              <ul>
                <li>We use the system file picker for selection.</li>
                <li>We do not require full storage access.</li>
                <li>You can revoke file access anytime in your phone’s settings.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <strong>✅ Notifications</strong>
          <ul>
            <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> What we collect:</strong> Alerts, updates, and reminders.</li>
            <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Why we collect it:</strong> To receive observation and broadcast notifications from officers.</li>
            <li  style={{fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Your control:</strong> You can turn off notifications in your device settings.</li>
          </ul>
        </div>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>2. Location Request and Handling Flow</h2>
        <p style={{fontSize:'14px'}}>Our app, Alpha Inspector, collects real-time location data only when you are <strong style={{fontSize:'15px'}}>on duty.</strong></p>
        <ul>
          <li  style={{marginBottom:'10px',fontSize:'14px'}}> If you are<strong style={{fontSize:'14px'}}> off duty</strong>, your location is not updated or collected.</li>
          <li style={{fontSize:'14px'}}> If you are <strong style={{fontSize:'14px'}}>on duty</strong>, we collect a GPS point every 30 minutes, even if the app is in the background.</li>
        </ul>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>3. Why We Need Location Access</h2>
        <p style={{fontSize:'14px'}}>We require <strong>"Allow all the time"</strong> location access for the following reasons:</p>
        <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
          <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}>✅ Real-time tracking (while on duty) –</strong> Ensures accurate duty status and operational monitoring.</li>
          <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}>✅ Background location updates (every 30 minutes, while on duty) –</strong> Maintains periodic tracking even when the app is minimized.</li>
          <li style={{fontSize:'14px'}}><strong style={{fontSize:'14px'}}>✅ Safety & compliance –</strong> Helps ensure security and regulatory compliance.</li>
        </ul>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>4. How You Can Control Location Access</h2>
        <p>You have full control over your location permissions. We recommend choosing:</p>
        <p style={{fontSize:'14px'}}>🔹 <strong style={{fontSize:'14px'}}>"Allow all the time" (Recommended) –</strong> Ensures location tracking every 30 minutes while you are on duty.</p>
        <p><strong style={{fontSize:'14px'}}>How to Manage Permissions:</strong></p>
        <p style={{fontSize:'14px'}}>
          <span role="img" aria-label="location">📍</span> Go to <strong>Settings &gt; Apps &gt; Alpha Inspector &gt; Permissions &gt; Location</strong>
        </p>
        <p style={{fontSize:'14px'}}>📍 Select <strong style={{fontSize:'14px'}}>"Allow all the time"</strong> (Recommended)</p>
        <p><strong style={{fontSize:'14px'}}>If you deny location access, some tracking-related features may not work as expected.</strong></p>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>5. Your Rights & Control Over Your Data</h2>
        <p style={{fontSize:'14px'}}><strong style={{fontSize:'14px'}}>You have full control over your personal data. You can:</strong></p>
        <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
        <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}>✅ Change Permissions –</strong> Enable or disable camera, location, or storage access anytime.</li>
          <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}>✅ Turn Off Notifications –</strong> Manage notifications from your phone settings.</li>
          <li style={{fontSize:'14px'}}><strong  style={{fontSize:'14px'}}>✅ Update Your Data –</strong> Request corrections if needed.</li>
        </ul>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>6. Data Sharing Policy</h2>
        <p style={{fontSize:'14px'}}><strong >We do not sell or share your personal data. However, limited data may be shared with:</strong></p>
        <ul>
          <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Service Providers –</strong> Only when required for app functionality (e.g., cloud storage, analytics).</li>
          <li  style={{marginBottom:'10px',fontSize:'14px'}}><strong style={{fontSize:'14px'}}> Legal Authorities –</strong> If required by law or for fraud prevention.</li>
        </ul>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>7. Policy Updates</h2>
        <p style={{fontSize:'14px'}}>We may update this policy from time to time. If there are major changes, we will notify you via the app.</p>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.contentSection}>
        <h2 style={styles.heading}>8. Contact Us</h2>
        <p style={{fontSize:'14px'}}>If you have any questions or concerns, feel free to reach out:</p>
        <p><strong>📧 Email:</strong> <a href="mailto:info@mindcoinservices.com">info@mindcoinservices.com</a></p>
        <p style={{fontSize:'14px'}}>By using Alpha Inspector, you agree to this Privacy Policy. If you have concerns, please contact us.</p>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "750px", margin: "20px auto", padding: "20px 45px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" },
  title: { color: "#2d8f5a", fontSize: "22px", textAlign: "center", marginBottom: "20px", },
  heading: { color: "#050505", fontSize: "18px", marginBottom: "10px" },
  paragraph: { lineHeight: "1.6", fontSize: "15px" },
  divider: { borderTop: "1px solid #BFBBA9", margin: "20px 0" },
  contentSection: { marginTop: "20px" }
};

export default PrivacyPolicy;
