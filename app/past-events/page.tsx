import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Past Events – UvaXtreme",
  description:
    "Explore all past UvaXtreme hackathon editions — from V1 in 2024 to V2 in 2025. See winners, photos, and event highlights.",
};

const events = [
  {
    version: "V1",
    edition: "Edition 01",
    title: "UvaXtreme V1",
    subtitle: "The Beginning",
    dates: ["June 29, 2024 (V1.0)", "January 5, 2025 (V1.1)"],
    venue: "Uva Wellassa University, Badulla",
    duration: "5 Hours",
    platform: "HackerRank",
    teams: "63+",
    participants: "250+",
    yearGroups: "3",
    image: "/images/v1/thank-you.jpg",
    href: "/events/v1",
    highlights: [
      "First-ever UvaXtreme hackathon",
      "300+ attendees at opening ceremony",
      "Guest speech by Prof. Sandya Kumari",
      "Beginner-friendly, all skill levels welcome",
      "Simultaneous competitions per academic year",
    ],
  },
  {
    version: "V2",
    edition: "Edition 02",
    title: "UvaXtreme V2",
    subtitle: "Bigger. Bolder. Better.",
    dates: ["November 23, 2025"],
    venue: "D1 Hall, Uva Wellassa University, Badulla",
    duration: "5 Hours",
    platform: "HackerRank",
    teams: "Multiple",
    participants: "All 4 Years",
    yearGroups: "4",
    image: "/images/v2/thank-you.png",
    href: "/events/v2",
    highlights: [
      "Extended to all 4 academic years",
      "Strict competition guidelines & manual verification",
      "12 teams crowned champions",
      "Full organizing committee structure",
      "Most competitive edition yet",
    ],
  },
];

export default function PastEventsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="past-events-hero relative overflow-hidden">
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%)",
            }}
          />
          <div className="bg-grid" style={{ position: "absolute", inset: 0 }} />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <Link
              href="/"
              className="event-hero-back"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}
            >
              ← Back to Home
            </Link>
            <span className="section-label section-label-purple">🕐 Event History</span>
            <h1 className="section-title" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", marginBottom: "16px" }}>
              All Past <span className="gradient-text">Events</span>
            </h1>
            <p className="section-subtitle">
              Every edition of UvaXtreme has been a milestone — fostering
              innovation, teamwork, and a love for competitive programming among
              Uva Wellassa University students.
            </p>
          </div>
        </section>

        {/* Events List */}
        <section className="section">
          <div className="container">
            <div className="past-events-list">
              {events.map((event, idx) => (
                <article
                  key={event.version}
                  className="past-event-row"
                  style={
                    idx % 2 === 1
                      ? { direction: "rtl" }
                      : {}
                  }
                >
                  <div
                    className="past-event-row-image"
                    style={idx % 2 === 1 ? { direction: "ltr" } : {}}
                  >
                    <Image
                      src={event.image}
                      alt={`${event.title} event photo`}
                      width={500}
                      height={280}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <div
                    className="past-event-row-content"
                    style={idx % 2 === 1 ? { direction: "ltr", paddingLeft: "40px", paddingRight: 0 } : {}}
                  >
                    <div>
                      <span className="event-card-version">{event.edition}</span>
                      <h2
                        className="section-title"
                        style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "8px 0" }}
                      >
                        {event.title}
                      </h2>
                      <p
                        style={{
                          color: "var(--accent-cyan)",
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.9rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {event.subtitle}
                      </p>
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {event.dates.map((d) => (
                        <div key={d} className="event-meta-item">
                          <span className="event-meta-icon">📅</span>
                          <span>{d}</span>
                        </div>
                      ))}
                      <div className="event-meta-item">
                        <span className="event-meta-icon">📍</span>
                        <span>{event.venue}</span>
                      </div>
                      <div className="event-meta-item">
                        <span className="event-meta-icon">⏱</span>
                        <span>{event.duration}</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <ul
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        listStyle: "none",
                      }}
                    >
                      {event.highlights.map((h) => (
                        <li
                          key={h}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            fontSize: "0.88rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <span style={{ color: "var(--accent-cyan)", marginTop: "2px", flexShrink: 0 }}>✓</span>
                          {h}
                        </li>
                      ))}
                    </ul>

                    {/* Stats */}
                    <div className="past-event-row-stats">
                      <div className="past-event-row-stat">
                        <span className="past-event-row-stat-value">{event.teams}</span>
                        <span className="past-event-row-stat-label">Teams</span>
                      </div>
                      <div className="past-event-row-stat">
                        <span className="past-event-row-stat-value">{event.yearGroups}</span>
                        <span className="past-event-row-stat-label">Year Groups</span>
                      </div>
                    </div>

                    <Link href={event.href} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                      View Full Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Coming Soon V3 Teaser */}
            <div className="cta-banner mt-48 text-center">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  padding: "8px 20px",
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: "100px",
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  color: "var(--accent-cyan)",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--accent-cyan)",
                    display: "inline-block",
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                />
                Coming Soon
              </div>
              <h3 className="section-title" style={{ marginBottom: "16px" }}>
                UvaXtreme V3 —{" "}
                <span className="gradient-text">The Next Chapter</span>
              </h3>
              <p className="section-subtitle" style={{ margin: "0 auto 32px" }}>
                The next edition is being planned. Stay tuned for announcements
                on our social media channels and the official website.
              </p>
              <a
                href="mailto:csieeeuwusb@gmail.com"
                className="btn btn-outline"
                id="past-events-notify-btn"
              >
                Get Notified
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
