import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ===================== HERO ===================== */}
        <section className="hero">
          <div className="hero-bg">
            <div className="bg-grid" />
          </div>

          {/* Floating blobs */}
          <div
            className="bg-blob-cyan"
            style={{ top: "-100px", left: "-100px" }}
          />
          <div
            className="bg-blob-purple"
            style={{ bottom: "0", right: "-100px" }}
          />

          <div className="container hero-content section">
            {/* Badge */}
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              IEEE Computer Society · UWU Student Branch Chapter
            </div>


            {/* Title */}
            <h1 className="hero-title">
              <span className="line-1">Code.</span>
              <span className="line-2">Compete. Conquer.</span>
            </h1>

            {/* Tagline */}
            <p className="hero-tagline">
              Sri Lanka&apos;s premier university-level hackathon series — where
              brilliant minds clash, algorithms collide, and champions rise.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-group">
              <Link href="/past-events" className="btn btn-primary">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Explore Past Events
              </Link>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== ABOUT ===================== */}
        <section className="section" id="about">
          <div className="container">
            <div className="about-grid">
              {/* Image */}
              <div
                className="about-image-wrap animate-fade-in-up"
                style={{ opacity: 0, animation: "fadeInUp 0.8s ease 0.1s forwards", position: "relative", height: "420px" }}
              >
                <Image
                  src="/images/uwu-intro2.png"
                  alt="Campus image"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>

              {/* Text */}
              <div className="about-text">
                <div>
                  <span className="section-label">⚡ About UvaXtreme</span>
                  <h2 className="section-title">
                    Where Code Meets{" "}
                    <span className="gradient-text">Competition</span>
                  </h2>
                </div>
                <p>
                  UvaXtreme is a group-based coding competition designed to test
                  problem-solving and teamwork skills. Presented by the{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    IEEE Computer Society Uva Wellassa University Student Branch
                    Chapter
                  </strong>
                  , it empowers students to sharpen their coding abilities while
                  building the confidence needed for real-world challenges.
                </p>
                <p>
                  Participants work in teams to solve programming challenges on
                  HackerRank, creating a competitive yet enjoyable environment.
                  By engaging in UvaXtreme, participants not only strengthen
                  their technical skills but also develop leadership, teamwork,
                  and critical thinking.
                </p>
                <div className="about-chips">
                  <span className="chip chip-cyan">HackerRank Platform</span>
                  <span className="chip chip-cyan">Team-Based</span>
                  <span className="chip">DSA Challenges</span>
                  <span className="chip">All Skill Levels</span>
                  <span className="chip">UWU, Badulla</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== STATS ===================== */}
        <section className="section-sm" style={{ background: "rgba(0,212,255,0.02)" }}>
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🏆</span>
                <div className="stat-number">3</div>
                <div className="stat-label">Editions</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <div className="stat-number">500+</div>
                <div className="stat-label">Participants</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💡</span>
                <div className="stat-number">100+</div>
                <div className="stat-label">Teams Competed</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🎓</span>
                <div className="stat-number">4</div>
                <div className="stat-label">Year Groups</div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ===================== PAST EVENTS ===================== */}
        <section className="section" id="past-events">
          <div className="container">
            <div className="text-center mb-48">
              <span className="section-label section-label-purple">
                🕐 Event History
              </span>
              <h2 className="section-title">
                Past <span className="gradient-text">Events</span>
              </h2>
              <p
                className="section-subtitle"
                style={{ margin: "16px auto 0" }}
              >
                From our inaugural edition to the latest showdown — every
                competition has raised the bar higher.
              </p>
            </div>

            <div className="events-grid">
              {/* V2 Card */}
              <div className="event-card">
                <div className="event-card-image">
                  <Image
                    src="/images/v2/organizing-committee.jpg"
                    alt="UvaXtreme V2 organizing committee"
                    width={600}
                    height={220}
                    style={{ width: "100%", height: "220px", objectFit: "cover" }}
                  />
                  <div className="event-card-image-overlay" />
                  <span className="event-card-badge badge-past">Completed</span>
                </div>
                <div className="event-card-body">
                  <div className="event-card-version">Edition 02</div>
                  <h3 className="event-card-title">UvaXtreme V2</h3>
                  <div className="event-card-meta">
                    <div className="event-meta-item">
                      <span className="event-meta-icon">📅</span>
                      <span>November 23, 2025</span>
                    </div>
                    <div className="event-meta-item">
                      <span className="event-meta-icon">📍</span>
                      <span>D1 Hall, UWU Badulla</span>
                    </div>
                    <div className="event-meta-item">
                      <span className="event-meta-icon">⏱</span>
                      <span>5 Hours</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                    Bigger. Better. More intense. V2 brought a full 4-year
                    competition format, strict guidelines, manual verification,
                    and champions crowned across all academic years.
                  </p>
                </div>
                <div className="event-card-footer">
                  <Link href="/events/v2" className="btn btn-outline w-full" style={{ justifyContent: "center" }}>
                    View Full Details →
                  </Link>
                </div>
              </div>

              {/* V1 Card */}
              <div className="event-card">
                <div className="event-card-image">
                  <Image
                    src="/images/v1/event-image.png"
                    alt="UvaXtreme V1 event"
                    width={600}
                    height={220}
                    style={{ width: "100%", height: "220px", objectFit: "cover" }}
                  />
                  <div className="event-card-image-overlay" />
                  <span className="event-card-badge badge-past">Completed</span>
                </div>
                <div className="event-card-body">
                  <div className="event-card-version">Edition 01</div>
                  <h3 className="event-card-title">UvaXtreme V1</h3>
                  <div className="event-card-meta">
                    <div className="event-meta-item">
                      <span className="event-meta-icon">📅</span>
                      <span>June 29, 2024 &amp; Jan 5, 2025</span>
                    </div>
                    <div className="event-meta-item">
                      <span className="event-meta-icon">📍</span>
                      <span>UWU, Badulla</span>
                    </div>
                    <div className="event-meta-item">
                      <span className="event-meta-icon">⏱</span>
                      <span>5 Hours</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                    The inaugural edition that kicked it all off. 63 teams,
                    250+ participants from 1st to 3rd year competing across
                    simultaneous HackerRank contests.
                  </p>
                </div>
                <div className="event-card-footer">
                  <Link href="/events/v1" className="btn btn-outline w-full" style={{ justifyContent: "center" }}>
                    View Full Details →
                  </Link>
                </div>
              </div>

            </div>

            <div className="text-center mt-48">
              <Link href="/past-events" className="btn btn-purple">
                View All Past Events
              </Link>
            </div>
          </div>
        </section>


      </main>
      <Footer />
    </>
  );
}