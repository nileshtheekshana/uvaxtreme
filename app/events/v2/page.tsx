import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "UvaXtreme V2 (2025) – Event Details",
  description:
    "UvaXtreme V2, November 23, 2025 — The biggest edition yet. 4 academic year groups, 12 champions, strict verification, and intense algorithmic challenges.",
};

const yearWinners = [
  {
    year: "1st Year",
    photo: "/images/v2/winners/1st-year.jpg",
    champion: "CODEBREW",
    runnerUp1: "EONX",
    runnerUp2: "CRUD OPS",
  },
  {
    year: "2nd Year",
    photo: "/images/v2/winners/2nd-year.jpg",
    champion: "PROMETHEUS",
    runnerUp1: "OMK",
    runnerUp2: "NEONNEXUS",
  },
  {
    year: "3rd Year",
    photo: "/images/v2/winners/3rd-year.jpg",
    champion: "TRIPLEBYTE",
    runnerUp1: "HACKHAWKS",
    runnerUp2: "INCODEX",
  },
  {
    year: "4th Year",
    photo: "/images/v2/winners/4th-year.jpg",
    champion: "CODEWARRIORS",
    runnerUp1: "REDSHIFT REBELS",
    runnerUp2: "BYTEKNIGHT",
  },
];

const committeePhotos = [
  { src: "/images/v2/committee/project-chairs.jpg", label: "Project Chairs & Team Leads" },
  { src: "/images/v2/committee/finance-team.jpg", label: "Finance Team" },
  { src: "/images/v2/committee/visibility-programming.jpg", label: "Public Visibility & Programming Team" },
  { src: "/images/v2/committee/secretary-logistics.jpg", label: "Secretary & Logistics Teams" },
];

const timeline = [
  { time: "7:30 AM – 9:00 AM", title: "Mandatory Check-In", desc: "QR code verification. Late arrivals (after 9:00 AM) not permitted without prior approval." },
  { time: "9:00 AM", title: "Hackathon Begins", desc: "D1 Hall (primary) + D2/D3 (quiet zones). All teams must be present and ready." },
  { time: "9:00 AM – 3:00 PM", title: "5-Hour Competition", desc: "DSA & algorithmic challenges on HackerRank, ranging from easy to hard difficulty." },
  { time: "During Event", title: "Attendance Monitoring", desc: "Max 1 hour cumulative absence allowed. Violations result in disqualification." },
  { time: "3:00 PM", title: "Submissions Close", desc: "Final HackerRank submissions evaluated. High-scoring teams undergo manual verification." },
  { time: "Post 3:00 PM", title: "Verification & Awards", desc: "Manual code explanation may be requested. Champions from each year group announced." },
];

const rules = [
  { icon: "👥", title: "Team Size", desc: "1–3 members per team. All members must be from the same academic year." },
  { icon: "💻", title: "Platform", desc: "HackerRank. AI tools allowed but must be declared; undisclosed use is penalized." },
  { icon: "✅", title: "Verification", desc: "High-scoring teams undergo manual verification — explain your code logic." },
  { icon: "🎫", title: "Ticket Required", desc: "Participants must show ticket QR code from confirmation email for entry." },
  { icon: "🏆", title: "Certificates", desc: "Top-rank teams receive printed certificates. Others receive digital participation certificates." },
  { icon: "💻", title: "Your Own Gear", desc: "Bring your own laptop, internet device, and power extensions. Not provided by organizers." },
  { icon: "📵", title: "Attendance", desc: "Leaving venue for more than 1 hour cumulatively results in disqualification." },
  { icon: "⚖️", title: "Final Authority", desc: "All organizing committee decisions are final and non-appealable." },
];

export default function V2EventPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ===================== HERO ===================== */}
        <section className="event-hero">
          <div className="event-hero-bg" />
          <div className="bg-grid" style={{ position: "absolute", inset: 0 }} />
          <div
            className="bg-blob-purple"
            style={{ top: "-100px", right: "0" }}
          />

          <div className="container event-hero-content">
            <Link href="/past-events" className="event-hero-back">
              ← Back to Past Events
            </Link>

            <span className="section-label section-label-purple">Edition 02</span>
            <h1
              className="hero-title"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", textAlign: "left", marginBottom: "20px" }}
            >
              UvaXtreme{" "}
              <span className="gradient-text">V2</span>
            </h1>
            <p
              style={{
                color: "var(--accent-cyan)",
                fontFamily: "var(--font-heading)",
                fontSize: "1rem",
                letterSpacing: "0.06em",
                marginBottom: "32px",
              }}
            >
              Bigger. Bolder. More Competitive — November 23, 2025
            </p>

            {/* Info Cards */}
            <div className="event-info-grid">
              <div className="event-info-card">
                <span className="event-info-card-label">📅 Date</span>
                <span className="event-info-card-value">November 23, 2025</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">📍 Venue</span>
                <span className="event-info-card-value">D1 Hall, UWU Badulla</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">⏱ Duration</span>
                <span className="event-info-card-value">5 Hours</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">🕢 Check-In</span>
                <span className="event-info-card-value">7:30 – 9:00 AM</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">🏫 Year Groups</span>
                <span className="event-info-card-value">1st – 4th Year</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">🏆 Champions</span>
                <span className="event-info-card-value">12 Teams Awarded</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">💻 Platform</span>
                <span className="event-info-card-value">HackerRank</span>
              </div>
              <div className="event-info-card">
                <span className="event-info-card-label">👤 Team Size</span>
                <span className="event-info-card-value">1–3 Members</span>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== ABOUT ===================== */}
        <section className="section">
          <div className="container">
            <div className="about-grid">
              <div>
                <span className="section-label">📖 About V2</span>
                <h2 className="section-title" style={{ marginBottom: "24px" }}>
                  The{" "}
                  <span className="gradient-text">Next Level</span>
                </h2>
                <div className="prose">
                  <p>
                    The IEEE Computer Society of Uva Wellassa University Student
                    Branch Chapter successfully concluded UvaXtreme v2 2025, an
                    exciting and highly competitive team-based coding
                    competition, held on 23rd November 2025 at the D1 Lecture
                    Hall, starting from 7.30 AM onwards.
                  </p>
                  <p>
                    The event brought together enthusiastic tech lovers,
                    problem-solvers, and curious learners, creating an energetic
                    atmosphere filled with innovation, collaboration, and
                    determination. UvaXtreme v2 2025 marked the return of one
                    of the most anticipated coding battles of the year,
                    challenging participants to face intense algorithmic and
                    logical problem-solving tasks.
                  </p>
                  <p>
                    Beyond coding, the event encouraged learning, resilience,
                    and collaboration, allowing participants to test their
                    limits and grow as future tech professionals. UvaXtreme v2
                    2025 was not only a competition but a celebration of
                    technology, teamwork, and passion for coding.
                  </p>
                </div>
              </div>

              <div>
                <div
                  style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "16px" }}
                >
                  <Image
                    src="/images/v2/organizing-committee.jpg"
                    alt="UvaXtreme V2 Full Organizing Committee"
                    width={600}
                    height={360}
                    style={{ width: "100%", height: "340px", objectFit: "cover" }}
                  />
                </div>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  UvaXtreme V2 Full Organizing Committee
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== TIMELINE ===================== */}
        <section className="section" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div className="container">
            <div className="text-center mb-48">
              <span className="section-label">🗓 Schedule</span>
              <h2 className="section-title">
                Event <span className="gradient-text">Timeline</span>
              </h2>
            </div>
            <div style={{ maxWidth: "720px", margin: "0 auto" }}>
              <div className="timeline">
                {timeline.map((item) => (
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
                          fontWeight: 600,
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
        </section>

        <div className="divider" />

        {/* ===================== RULES ===================== */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-48">
              <span className="section-label">📋 Competition Framework</span>
              <h2 className="section-title">
                Rules &{" "}
                <span className="gradient-text">Regulations</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "16px auto 0" }}>
                V2 introduced a formal competition framework with detailed
                articles covering all aspects of participation.
              </p>
            </div>
            <div className="grid-4">
              {rules.map((rule) => (
                <div key={rule.title} className="card" style={{ padding: "24px" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>
                    {rule.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    {rule.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
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
                V2 <span className="gradient-text">Champions</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "16px auto 0" }}>
                Winners crowned across all 4 academic year groups
              </p>
            </div>

            <div className="grid-2" style={{ gap: "32px" }}>
              {yearWinners.map((winner) => (
                <div key={winner.year} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ position: "relative", height: "220px" }}>
                    <Image
                      src={winner.photo}
                      alt={`UvaXtreme V2 ${winner.year} winners`}
                      width={600}
                      height={220}
                      style={{ width: "100%", height: "220px", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, transparent 30%, rgba(5,8,17,0.85) 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        padding: "4px 14px",
                        background: "rgba(5,8,17,0.7)",
                        border: "1px solid rgba(0,212,255,0.3)",
                        borderRadius: "100px",
                        backdropFilter: "blur(8px)",
                        fontSize: "0.72rem",
                        fontFamily: "var(--font-heading)",
                        color: "var(--accent-cyan)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {winner.year}
                    </div>
                  </div>
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { rank: "🥇 Champion", team: winner.champion, style: { color: "#f59e0b" } },
                      { rank: "🥈 1st Runner Up", team: winner.runnerUp1, style: { color: "#94a3b8" } },
                      { rank: "🥉 2nd Runner Up", team: winner.runnerUp2, style: { color: "#92400e" } },
                    ].map((place) => (
                      <div
                        key={place.rank}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {place.rank}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            ...place.style,
                          }}
                        >
                          {place.team}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== COMMITTEE GALLERY ===================== */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-48">
              <span className="section-label">📸 Organizing Committee</span>
              <h2 className="section-title">
                The Team Behind{" "}
                <span className="gradient-text">V2</span>
              </h2>
            </div>
            <div className="gallery-grid">
              {committeePhotos.map((img) => (
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
              <div className="gallery-item">
                <Image
                  src="/images/v2/organizing-committee.jpg"
                  alt="Full Organizing Committee"
                  width={400}
                  height={300}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="gallery-item-overlay">
                  <span className="gallery-item-label">Full Organizing Committee</span>
                </div>
              </div>
              <div className="gallery-item">
                <Image
                  src="/images/v2/thank-you.png"
                  alt="Thank You Participants"
                  width={400}
                  height={300}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="gallery-item-overlay">
                  <span className="gallery-item-label">Thank You Participants</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== CTA ===================== */}
        <section className="section-sm">
          <div className="container">
            <div className="cta-banner text-center">
              <h3 className="section-title" style={{ marginBottom: "16px" }}>
                What&apos;s Next?
              </h3>
              <p className="section-subtitle" style={{ margin: "0 auto 32px" }}>
                UvaXtreme V3 is on the horizon. Stay connected with the IEEE CS
                UWU Student Branch Chapter for announcements.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="mailto:csieeeuwusb@gmail.com"
                  className="btn btn-primary"
                  id="v2-notify-btn"
                >
                  Get Notified for V3
                </a>
                <Link href="/events/v1" className="btn btn-outline">
                  ← View V1
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
