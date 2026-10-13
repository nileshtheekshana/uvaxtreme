import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "UvaXtreme V1 (2024–25) – Event Details",
  description:
    "UvaXtreme V1 — The inaugural hackathon edition by IEEE CS UWU. Held in June 2024 and January 2025. 63+ teams, 250+ participants, 3 academic years competing.",
};

const yearWinners = [
  {
    year: "1st Year",
    photo: "/images/v1/winners/1st-year.jpg",
    description: "First-year students showcasing strong fundamentals",
  },
  {
    year: "2nd Year",
    photo: "/images/v1/winners/2nd-year.jpg",
    description: "Second-year teams leveraging intermediate skills",
  },
  {
    year: "3rd Year",
    photo: "/images/v1/winners/3rd-year.jpg",
    description: "Final-year champions demonstrating mastery",
  },
];

const v10Timeline = [
  {
    time: "Before 4:00 PM",
    title: "Registration & Check-in",
    desc: "Teams register and set up on HackerRank",
  },
  {
    time: "4:00 PM",
    title: "Hackathon Begins",
    desc: "Online via HackerRank across all year groups simultaneously",
  },
  {
    time: "4:30 PM",
    title: "Guest Address",
    desc: "Inspiring speech by Prof. Sandya Kumari",
  },
  {
    time: "7:00 PM",
    title: "Hackathon Ends",
    desc: "Submissions close, results processing begins",
  },
  {
    time: "Post-Event",
    title: "Winner Announcement & Certificates",
    desc: "Top teams recognized with certificates",
  },
];

const v11Timeline = [
  {
    time: "8:00 AM – 8:45 AM",
    title: "Mandatory Check-In",
    desc: "QR code verification via ticket email",
  },
  {
    time: "9:00 AM",
    title: "Hackathon Begins",
    desc: "D1 Hall (primary) + D2/D3 (quiet zones). Questions released every 20 minutes.",
  },
  {
    time: "9:00 AM – 2:00 PM",
    title: "Competition (5 Hours)",
    desc: "DSA and syllabus-based challenges, easy to hard difficulty",
  },
  {
    time: "2:00 PM",
    title: "Submissions Close",
    desc: "Top 3 teams per year group selected",
  },
  {
    time: "Post 2:00 PM",
    title: "Certificate Distribution",
    desc: "Printed for top teams, digital for all participants",
  },
];

export default function V1EventPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ===================== HERO ===================== */}
        <section className="event-hero">
          <div className="event-hero-bg" />
          <div className="bg-grid" style={{ position: "absolute", inset: 0 }} />
          <div
            className="bg-blob-cyan"
            style={{ top: "-100px", right: "0" }}
          />

          <div className="container event-hero-content">
            <Link href="/past-events" className="event-hero-back">
              ← Back to Past Events
            </Link>

            <span className="section-label section-label-purple">Edition 01</span>
            <h1
              className="hero-title"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", textAlign: "left", marginBottom: "20px" }}
            >
              UvaXtreme{" "}
              <span className="gradient-text">V1</span>
            </h1>
            <p style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-heading)", fontSize: "1rem", letterSpacing: "0.06em", marginBottom: "32px" }}>
              The Inaugural Edition — Where It All Began
            </p>

            {/* Info Cards */}
            <div className="event-info-grid">
              <div className="event-info-card">
                <span className="event-info-card-label">📅 V1.0 Date</span>
                <span className="event-info-card-value">June 29, 2024</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">📅 V1.1 Date</span>
                <span className="event-info-card-value">January 5, 2025</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">📍 Venue</span>
                <span className="event-info-card-value">UWU, Badulla</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">⏱ Duration</span>
                <span className="event-info-card-value">5 Hours</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">👥 Teams</span>
                <span className="event-info-card-value">63+ Teams</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">🎓 Participants</span>
                <span className="event-info-card-value">250+ Students</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">💻 Platform</span>
                <span className="event-info-card-value">HackerRank</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">🏫 Year Groups</span>
                <span className="event-info-card-value">1st – 3rd Year</span>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== ABOUT THE EVENT ===================== */}
        <section className="section">
          <div className="container">
            <div className="about-grid">
              <div>
                <span className="section-label">📖 About V1.0</span>
                <h2 className="section-title" style={{ marginBottom: "24px" }}>
                  The <span className="gradient-text">First Chapter</span>
                </h2>
                <div className="prose">
                  <p>
                    UvaXtreme 1.0, organized by the IEEE Student Branch of Uva
                    Wellassa University, was held on June 29, 2024. This event
                    provided a platform for students across various academic
                    years to showcase their coding and problem-solving skills in
                    a supportive and competitive environment.
                  </p>
                  <p>
                    Designed to be inclusive and beginner-friendly, UvaXtreme
                    1.0 encouraged participation from students at all levels of
                    study, promoting skill development and peer engagement. A
                    total of 63 teams, comprising over 250 students from 1st,
                    2nd, and 3rd years participated, with 300 attendees at the
                    opening ceremony.
                  </p>
                  <p>
                    Each year had its own separate hackathon hosted
                    simultaneously via HackerRank, ensuring fair competition
                    with challenges tailored to each level of study.
                  </p>
                </div>

                {/* Highlights */}
                <div
                  style={{
                    marginTop: "28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {[
                    "300+ attendees at the opening ceremony",
                    "Guest speech by Prof. Sandya Kumari",
                    "IEEE introduction and membership benefits session",
                    "Technical walkthrough of HackerRank platform",
                    "Simultaneous competitions per academic year",
                  ].map((h) => (
                    <div
                      key={h}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span style={{ color: "var(--accent-cyan)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "20px" }}>
                  <Image
                    src="/images/v1/organizing-committee.jpg"
                    alt="UvaXtreme V1 Organizing Committee"
                    width={600}
                    height={380}
                    style={{ width: "100%", height: "340px", objectFit: "cover" }}
                  />
                </div>
                <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  UvaXtreme V1 Organizing Committee
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== V1.0 TIMELINE ===================== */}
        <section className="section" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div className="container">
            <div className="grid-2" style={{ gap: "64px", alignItems: "start" }}>
              <div>
                <span className="section-label">🗓 V1.0 Schedule</span>
                <h2 className="section-title" style={{ marginBottom: "36px" }}>
                  Event Timeline —{" "}
                  <span className="gradient-text">June 2024</span>
                </h2>
                <div className="timeline">
                  {v10Timeline.map((item) => (
                    <div key={item.title} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--accent-cyan)",
                            fontFamily: "var(--font-heading)",
                            letterSpacing: "0.08em",
                            marginBottom: "4px",
                          }}
                        >
                          {item.time}
                        </div>
                        <div className="timeline-title">{item.title}</div>
                        <div className="timeline-desc">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="section-label">🗓 V1.1 Schedule</span>
                <h2 className="section-title" style={{ marginBottom: "36px" }}>
                  Event Timeline —{" "}
                  <span className="gradient-text">Jan 2025</span>
                </h2>
                <div className="timeline">
                  {v11Timeline.map((item) => (
                    <div key={item.title} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--accent-cyan)",
                            fontFamily: "var(--font-heading)",
                            letterSpacing: "0.08em",
                            marginBottom: "4px",
                          }}
                        >
                          {item.time}
                        </div>
                        <div className="timeline-title">{item.title}</div>
                        <div className="timeline-desc">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== RULES HIGHLIGHTS ===================== */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-48">
              <span className="section-label">📋 Competition Rules</span>
              <h2 className="section-title">
                Key <span className="gradient-text">Rules & Regulations</span>
              </h2>
            </div>
            <div className="grid-3" style={{ gap: "20px" }}>
              {[
                {
                  icon: "👥",
                  title: "Team Size",
                  desc: "2–4 members per team. All members from the same academic year.",
                },
                {
                  icon: "💻",
                  title: "Platform",
                  desc: "HackerRank. Questions released every 20 minutes, easy to hard.",
                },
                {
                  icon: "✍️",
                  title: "Original Work",
                  desc: "All solutions must be developed during the event. No pre-existing code.",
                },
                {
                  icon: "🎫",
                  title: "Ticket Required",
                  desc: "Entry requires presentation of ticket confirmation email with QR code.",
                },
                {
                  icon: "🏆",
                  title: "Certificates",
                  desc: "Top 3 per year get printed certificates. All others receive digital.",
                },
                {
                  icon: "💻",
                  title: "Bring Your Own",
                  desc: "Participants must bring laptops, chargers, and personal internet.",
                },
              ].map((rule) => (
                <div key={rule.title} className="card" style={{ padding: "28px" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{rule.icon}</div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    {rule.title}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== WINNERS ===================== */}
        <section className="section" style={{ background: "rgba(124,58,237,0.03)" }}>
          <div className="container">
            <div className="text-center mb-48">
              <span className="section-label section-label-purple">🏆 Hall of Fame</span>
              <h2 className="section-title">
                V1 <span className="gradient-text">Winners</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "16px auto 0" }}>
                UvaXtreme V1.1 — Champions crowned across all year groups
              </p>
            </div>

            <div className="winners-grid">
              {yearWinners.map((winner) => (
                <div key={winner.year} className="winner-card">
                  <Image
                    src={winner.photo}
                    alt={`${winner.year} winners of UvaXtreme V1`}
                    width={400}
                    height={220}
                    className="winner-photo"
                  />
                  <div className="winner-info">
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        background: "rgba(0,212,255,0.1)",
                        border: "1px solid rgba(0,212,255,0.25)",
                        borderRadius: "100px",
                        fontSize: "0.72rem",
                        fontFamily: "var(--font-heading)",
                        color: "var(--accent-cyan)",
                        marginBottom: "12px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {winner.year}
                    </div>
                    <div className="winner-team-name">UvaXtreme V1.1 Winners</div>
                    <div className="winner-year-label">{winner.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== GALLERY ===================== */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-48">
              <span className="section-label">📸 Memories</span>
              <h2 className="section-title">
                Event <span className="gradient-text">Gallery</span>
              </h2>
            </div>
            <div className="gallery-grid">
              {[
                { src: "/images/v1/organizing-committee.jpg", label: "Organizing Committee" },
                { src: "/images/v1/thank-you.jpg", label: "Thank You Participants" },
                { src: "/images/v1/winners/1st-year.jpg", label: "1st Year Winners" },
                { src: "/images/v1/winners/2nd-year.jpg", label: "2nd Year Winners" },
                { src: "/images/v1/winners/3rd-year.jpg", label: "3rd Year Winners" },
              ].map((img) => (
                <div key={img.src} className="gallery-item">
                  <Image
                    src={img.src}
                    alt={img.label}
                    width={400}
                    height={300}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div className="gallery-item-overlay">
                    <span className="gallery-item-label">{img.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== NEXT / CTA ===================== */}
        <section className="section-sm">
          <div className="container">
            <div className="cta-banner text-center">
              <h3 className="section-title" style={{ marginBottom: "16px" }}>
                See What Came Next
              </h3>
              <p className="section-subtitle" style={{ margin: "0 auto 32px" }}>
                UvaXtreme V2 in November 2025 raised the bar even higher with 4
                year groups, stricter guidelines, and more champions.
              </p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/events/v2" className="btn btn-primary">
                  View UvaXtreme V2 →
                </Link>
                <Link href="/past-events" className="btn btn-outline">
                  All Past Events
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
