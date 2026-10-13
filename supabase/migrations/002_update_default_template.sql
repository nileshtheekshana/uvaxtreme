-- =============================================================================
-- UWAXtreme Finance Portal — Migration 002
-- Updates the default proposal template to the real UvaXtreme V3 email.
-- Run in Supabase SQL Editor after migration 001.
-- =============================================================================

UPDATE public.proposal_templates
SET
  name    = 'UvaXtreme 2026 Partnership Proposal',
  subject = 'Partnership Proposal for {{company_name}} – UvaXtreme 2026 | IEEE CS UWU',
  body    = 'Dear {{recipient_name}},

I hope this message finds you well.

I am writing on behalf of the IEEE Computer Society Student Branch Chapter of Uva Wellassa University to invite {{company_name}} to partner with us for UvaXtreme 2026 (Edition V3) — our flagship group-based competitive programming competition.

UvaXtreme is an initiative designed to challenge and enhance problem-solving, algorithmic programming, and teamwork skills among undergraduate students, preparing them for future academic, professional, and real-world challenges. Following the successful completion of UvaXtreme V1 (2024) and V2 (2025), this year’s edition aims to expand its reach through stronger industry collaboration and greater participation.

Why Partner with UvaXtreme 2026:
• Talent Engagement Opportunities: Connect with talented undergraduate programmers and software engineering students for internship and graduate recruitment opportunities.
• Brand Visibility & Recognition: Gain prominent brand exposure through our digital campaigns (Facebook, LinkedIn, Instagram), official website, event flyers, backdrops, and official publications.
• Industry Engagement: Receive dedicated presentation opportunities, corporate video showcase slots during the main event, and executive invitations for company representatives.

Please find our official proposal dossier attached for your review, which includes detailed information about the event structure, partnership tiers, budget overview, and collaboration benefits.

We would highly appreciate the opportunity to collaborate with {{company_name}} and contribute together towards empowering the next generation of technology innovators. We would be glad to schedule a brief meeting at your convenience to discuss this partnership further.

Thank you for your time and consideration. We look forward to the possibility of working together.

Kind regards,

{{sender_name}}
Finance Committee | UvaXtreme 2026
IEEE Computer Society Student Branch Chapter
Uva Wellassa University of Sri Lanka
Email: {{sender_email}}
Phone: {{sender_phone}}
Website: https://uvaxtreme.dev'
WHERE is_default = true;
