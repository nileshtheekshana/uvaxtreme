/**
 * app/finance/proposals/new/page.tsx
 * Proposal editor — Server Component that loads data, then mounts client form.
 */

import type { Metadata } from "next";
import { requireFinanceAuth } from "@/lib/finance/session";
import { createFinanceServerClient } from "@/lib/finance/supabase";
import PortalNav from "../../_components/PortalNav";
import ProposalEditor from "./_components/ProposalEditor";

export const metadata: Metadata = {
  title: "New Proposal",
};

// Default template used when Supabase has no templates (before migration runs)
const FALLBACK_TEMPLATE = {
  id: "default",
  name: "UvaXtreme 2026 Sponsorship Proposal",
  is_default: true,
  subject: "Partnership Proposal for {{company_name}} – UvaXtreme 2026 | IEEE CS UWU",
  body: `Dear {{recipient_name}},

I hope this message finds you well.

I am writing on behalf of the IEEE Computer Society Student Branch Chapter of Uva Wellassa University to invite {{company_name}} to partner with us for UvaXtreme 2026 (Edition V3) , our flagship group-based competitive programming competition.

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
Website: https://uvaxtreme.dev`,
};

export default async function NewProposalPage() {
  const { profile } = await requireFinanceAuth();
  const supabase = await createFinanceServerClient();

  // Load templates and companies for the form
  const [{ data: templates }, { data: companies }] = await Promise.all([
    supabase
      .from("proposal_templates")
      .select("id, name, subject, body, is_default")
      .order("is_default", { ascending: false })
      .order("name"),
    supabase
      .from("companies")
      .select("id, name, email, contact")
      .order("name"),
  ]);

  const serializedProfile = {
    id: profile.id,
    full_name: profile.full_name,
    domain_email: profile.domain_email,
    role: profile.role,
  };

  // Use DB templates if available, otherwise fall back to the hardcoded default
  const resolvedTemplates =
    templates && templates.length > 0 ? templates : [FALLBACK_TEMPLATE];

  return (
    <div className="fp-shell">
      <PortalNav profile={profile} />
      <main className="fp-main">
        <div className="fp-page-header">
          <div>
            <h1 className="fp-page-title">New Proposal</h1>
            <p className="fp-page-subtitle">
              Sending from <strong>{profile.domain_email}</strong>
            </p>
          </div>
        </div>

        <ProposalEditor
          profile={serializedProfile}
          templates={resolvedTemplates}
          companies={companies ?? []}
          defaultPdfUrl="/Sponsorship Proposal.pdf"
        />
      </main>
    </div>
  );
}

