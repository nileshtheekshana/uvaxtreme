"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <Image
            src="/images/logos/uvaxtreme v3 white logo.png"
            alt="UvaXtreme"
            width={200}
            height={56}
            style={{ height: "48px", width: "auto" }}
            priority
          />
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links">
          <li>
            <Link href="/#about" className="navbar-link">
              About
            </Link>
          </li>
          <li>
            <Link href="/past-events" className="navbar-link">
              Past Events
            </Link>
          </li>

          <li>
            <Link href="/#contact" className="navbar-link">
              Contact
            </Link>
          </li>
        </ul>

        {/* CTA */}
        <Link href="/#about" className="btn btn-outline navbar-cta">
          Register Interest
        </Link>

        {/* Mobile Hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="navbar-menu-toggle"
        >
          <span
            style={{
              transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            }}
          />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span
            style={{
              transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "72px",
            left: 0,
            right: 0,
            background: "rgba(5,8,17,0.97)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            zIndex: 999,
          }}
        >
          <Link
            href="/#about"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/past-events"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            Past Events
          </Link>

          <Link
            href="/#contact"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}
