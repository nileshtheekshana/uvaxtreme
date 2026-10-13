import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Image
              src="/images/logos/uvaxtreme v3 white logo.png"
              alt="UvaXtreme"
              width={220}
              height={60}
              style={{ height: "56px", width: "auto" }}
            />
            <p>
              A group-based coding competition by the IEEE Computer Society Uva
              Wellassa University Student Branch Chapter. Empowering students
              through innovation and competition.
            </p>
            {/* Social Links */}
            <div className="footer-social" style={{ marginTop: "8px" }}>
              <a
                href="https://www.facebook.com/ieeeuwu"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook"
                id="footer-facebook"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/ieee-cs-uwu"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
                id="footer-linkedin"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/ieeeuwu"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
                id="footer-instagram"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="footer-col-title">Quick Links</p>
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/#about">About</Link>
              </li>
              <li>
                <Link href="/past-events">Past Events</Link>
              </li>

            </ul>
          </div>

          {/* Past Events */}
          <div>
            <p className="footer-col-title">Past Events</p>
            <ul className="footer-links">
              <li>
                <Link href="/events/v1">UvaXtreme V1 (2024–25)</Link>
              </li>
              <li>
                <Link href="/events/v2">UvaXtreme V2 (2025)</Link>
              </li>
            </ul>
            <div style={{ marginTop: "24px" }}>
              <p className="footer-col-title">Contact</p>
              <ul className="footer-links">
                <li>
                  <a href="mailto:csieeeuwusb@gmail.com">
                    csieeeuwusb@gmail.com
                  </a>
                </li>
                <li>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Badulla, Sri Lanka
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>
            © {year} UvaXtreme. All rights reserved. Presented by IEEE CS UWU
            Student Branch Chapter.
          </p>
          <div className="footer-org-logos">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "10px 20px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(8px)",
              }}
            >
              <Image
                src="/images/logos/uva wellassa university logo.png"
                alt="Uva Wellassa University"
                width={120}
                height={48}
                style={{ height: "44px", width: "auto", objectFit: "contain" }}
              />
              <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.15)" }} />
              <Image
                src="/images/logos/ieee uwu computer soceity logo.png"
                alt="IEEE CS UWU"
                width={120}
                height={48}
                style={{ height: "44px", width: "auto", objectFit: "contain" }}
              />
              <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.15)" }} />
              <Image
                src="/images/logos/ieee uwu student branch logo.png"
                alt="IEEE UWU Student Branch"
                width={120}
                height={48}
                style={{ height: "44px", width: "auto", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
