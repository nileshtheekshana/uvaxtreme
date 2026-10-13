"use client";

/**
 * app/finance/proposals/new/_components/ProposalEditor.tsx
 * Full interactive proposal editor with live preview and confirmation dialog.
 * - Sender signature fields (name, phone, email) editable per member
 * - "Use Default PDF" button loads Sponsorship Proposal.pdf from public/
 * - {{placeholders}} auto-filled in preview
 */

import { useState, useActionState, useCallback, useRef, useEffect } from "react";
import { sendProposalEmail } from "@/app/actions/finance/email";
import type { SendEmailResult } from "@/app/actions/finance/email";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
}

interface Company {
  id: string;
  name: string;
  email: string;
  contact: string | null;
}

interface ProposalProfile {
  id: string;
  full_name: string;
  domain_email: string;
  role: string;
}

interface Props {
  profile: ProposalProfile;
  templates: Template[];
  companies: Company[];
  defaultPdfUrl?: string; // e.g. "/Sponsorship Proposal.pdf"
}

type Tab = "compose" | "preview" | "confirm";

const initialState: SendEmailResult = {};

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

function fillPlaceholders(
  text: string,
  replacements: Record<string, string>
): string {
  return text.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => replacements[key] ?? `{{${key}}}`
  );
}

export default function ProposalEditor({
  profile,
  templates,
  companies,
  defaultPdfUrl,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    sendProposalEmail,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [toAddress, setToAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates.find((t) => t.is_default)?.id ?? templates[0]?.id ?? ""
  );
  const [subject, setSubject] = useState(
    templates.find((t) => t.is_default)?.subject ?? ""
  );
  const [body, setBody] = useState(
    templates.find((t) => t.is_default)?.body ?? ""
  );
  // attachmentMode: "none" | "default" (server reads file) | "custom" (user uploads)
  const [attachmentMode, setAttachmentMode] = useState<"none" | "default" | "custom">("none");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>("compose");
  const [idempotencyKey] = useState<string>(generateIdempotencyKey());
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // Keep hidden file input in sync with customFile (only needed for "custom" mode)
  useEffect(() => {
    if (!fileInputRef.current) return;
    if (attachmentMode === "custom" && customFile) {
      const dt = new DataTransfer();
      dt.items.add(customFile);
      fileInputRef.current.files = dt.files;
    } else {
      fileInputRef.current.value = "";
    }
  }, [attachmentMode, customFile]);

  // Sender signature fields — editable per send
  const [senderName, setSenderName] = useState(profile.full_name);
  const [senderPhone, setSenderPhone] = useState("+94 76 283 2088");
  const [senderEmail, setSenderEmail] = useState(profile.domain_email);

  const MAX_SIZE_MB = 40;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Preview with substitutions
  const recipientGreeting = companyName ? `${companyName} Team` : "Sir/Madam";
  const previewBody = fillPlaceholders(body, {
    recipient_name:  recipientGreeting,
    company_name:    companyName || "your organization",
    sender_name:     senderName,
    sender_phone:    senderPhone || "[Phone]",
    sender_email:    senderEmail,
  });
  const previewSubject = companyName
    ? fillPlaceholders(subject, { company_name: companyName })
    : subject.replace(/for\s*\{\{company_name\}\}\s*[–-]\s*/i, "").replace(/\{\{company_name\}\}/g, "").trim();

  // Resolved body for hidden field (replaces placeholders with real values)
  const resolvedBody = fillPlaceholders(body, {
    recipient_name: recipientGreeting,
    company_name:   companyName || "your organization",
    sender_name:    senderName,
    sender_phone:   senderPhone,
    sender_email:   senderEmail,
  });

  // Handle template selection
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      setSelectedTemplateId(templateId);
      const tpl = templates.find((t) => t.id === templateId);
      if (tpl) {
        setSubject(tpl.subject);
        setBody(tpl.body);
      }
    },
    [templates]
  );

  // Handle company selection
  const handleCompanySelect = useCallback(
    (companyId: string) => {
      const company = companies.find((c) => c.id === companyId);
      if (company) {
        setToAddress(company.email);
        setCompanyName(company.name);
      }
    },
    [companies]
  );

  // Handle manual file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachmentError(null);
    if (!file) { setAttachmentMode("none"); setCustomFile(null); return; }
    if (file.type !== "application/pdf") {
      setAttachmentError("Only PDF files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setAttachmentError(`File too large. Maximum is ${MAX_SIZE_MB} MB.`);
      e.target.value = "";
      return;
    }
    setCustomFile(file);
    setAttachmentMode("custom");
  };

  // Select default PDF — no download needed; server action reads it from disk
  const selectDefaultPdf = () => {
    setAttachmentError(null);
    setCustomFile(null);
    setAttachmentMode("default");
  };

  const removeAttachment = () => {
    setAttachmentMode("none");
    setCustomFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const canSend =
    toAddress.trim() !== "" &&
    subject.trim() !== "" &&
    body.trim() !== "" &&
    senderName.trim() !== "";

  // Success state
  if (state.success) {
    return (
      <div className="fp-card fp-success-card">
        <div className="fp-success-icon">✅</div>
        <h2 className="fp-success-title">Proposal Sent!</h2>
        <p className="fp-success-text">
          Your email to <strong>{toAddress}</strong> has been queued with your
          email provider. The administrator has been notified via BCC.
        </p>
        <div className="fp-success-actions">
          <a href="/finance/proposals/new" className="fp-btn fp-btn-primary">
            Send Another
          </a>
          <a href="/finance/history" className="fp-btn fp-btn-outline">
            View History
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-editor-wrapper">
      {/* Tabs */}
      <div className="fp-tabs">
        <button
          type="button"
          className={`fp-tab ${tab === "compose" ? "fp-tab-active" : ""}`}
          onClick={() => setTab("compose")}
        >
          ✏️ Compose
        </button>
        <button
          type="button"
          className={`fp-tab ${tab === "preview" ? "fp-tab-active" : ""}`}
          onClick={() => canSend && setTab("preview")}
          disabled={!canSend}
          title={canSend ? undefined : "Fill in required fields first"}
        >
          👁 Preview
        </button>
        <button
          type="button"
          className={`fp-tab ${tab === "confirm" ? "fp-tab-active" : ""}`}
          onClick={() => canSend && setTab("confirm")}
          disabled={!canSend}
          title={canSend ? undefined : "Fill in required fields first"}
        >
          🚀 Send
        </button>
      </div>

      <form ref={formRef} action={formAction}>
        <input type="hidden" name="idempotency_key" value={idempotencyKey} />
        <input type="hidden" name="template_id" value={selectedTemplateId} />
        {/* Hidden fields carry resolved compose state into form submit */}
        <input type="hidden" name="to_address" value={toAddress} />
        <input type="hidden" name="company_name" value={companyName} />
        <input type="hidden" name="sender_name" value={senderName} />
        <input type="hidden" name="sender_phone" value={senderPhone} />
        <input type="hidden" name="sender_email" value={senderEmail} />
        <input type="hidden" name="subject" value={previewSubject} />
        {/* Send resolved body (placeholders already substituted) */}
        <input type="hidden" name="body" value={resolvedBody} />
        {/* Tell server to read default PDF from disk — no client-side download */}
        {attachmentMode === "default" && (
          <input type="hidden" name="use_default_pdf" value="true" />
        )}
        {/* Always-present hidden file input for custom uploads */}
        <input
          ref={fileInputRef}
          name="attachment"
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* ── Compose Tab ─────────────────────────────────────────────────── */}
        {tab === "compose" && (
          <div className="fp-card fp-compose-card">
            {state.error && (
              <div className="fp-alert fp-alert-error" role="alert">
                <span>⚠️</span>
                <span>{state.error}</span>
              </div>
            )}

            {/* From (read-only) */}
            <div className="fp-field">
              <label className="fp-label">From</label>
              <div className="fp-input fp-input-readonly">
                {profile.full_name} &lt;{profile.domain_email}&gt;
              </div>
            </div>

            {/* Company selector */}
            {companies.length > 0 && (
              <div className="fp-field">
                <label className="fp-label">Quick-select Company</label>
                <select
                  className="fp-input"
                  onChange={(e) => handleCompanySelect(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select from approved companies…
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Recipient */}
            <div className="fp-field">
              <label htmlFor="to" className="fp-label">
                To <span className="fp-required">*</span>
              </label>
              <input
                id="to"
                type="email"
                className="fp-input"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="sponsor@company.com"
                required
              />
              {state.fieldErrors?.to_address && (
                <p className="fp-field-error">{state.fieldErrors.to_address[0]}</p>
              )}
            </div>

            {/* Company name */}
            <div className="fp-field">
              <label htmlFor="cname" className="fp-label">
                Company Name
              </label>
              <input
                id="cname"
                type="text"
                className="fp-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>

            {/* Template selector */}
            {templates.length > 0 && (
              <div className="fp-field">
                <label className="fp-label">Email Template</label>
                <select
                  className="fp-input"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.is_default ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject */}
            <div className="fp-field">
              <label htmlFor="subj" className="fp-label">
                Subject <span className="fp-required">*</span>
              </label>
              <input
                id="subj"
                type="text"
                className="fp-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              {state.fieldErrors?.subject && (
                <p className="fp-field-error">{state.fieldErrors.subject[0]}</p>
              )}
            </div>

            {/* Body */}
            <div className="fp-field">
              <label htmlFor="body" className="fp-label">
                Message <span className="fp-required">*</span>
              </label>
              <p className="fp-field-hint">
                Placeholders filled automatically in preview:{" "}
                <code>{"{{recipient_name}}"}</code>{" "}
                <code>{"{{company_name}}"}</code>{" "}
                <code>{"{{sender_name}}"}</code>{" "}
                <code>{"{{sender_phone}}"}</code>{" "}
                <code>{"{{sender_email}}"}</code>
              </p>
              <textarea
                id="body"
                className="fp-input fp-textarea"
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              {state.fieldErrors?.body && (
                <p className="fp-field-error">{state.fieldErrors.body[0]}</p>
              )}
            </div>

            {/* ── Sender Signature ─────────────────────────────────────────── */}
            <div className="fp-field">
              <label className="fp-label">Your Signature Details</label>
              <p className="fp-field-hint">
                These replace <code>{"{{sender_name}}"}</code>,{" "}
                <code>{"{{sender_phone}}"}</code>, and{" "}
                <code>{"{{sender_email}}"}</code> in the email body.
              </p>
              <div style={{ display: "grid", gap: "10px" }}>
                <input
                  type="text"
                  className="fp-input"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
                <input
                  type="tel"
                  className="fp-input"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="Phone number (e.g. 0777123456)"
                />
                <input
                  type="email"
                  className="fp-input"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* ── Attachment ──────────────────────────────────────────────── */}
            <div className="fp-field">
              <label className="fp-label">Sponsorship Proposal PDF</label>
              <p className="fp-field-hint">PDF only · Max {MAX_SIZE_MB} MB</p>

              {attachmentError && (
                <p className="fp-field-error">{attachmentError}</p>
              )}

              {attachmentMode !== "none" ? (
                /* Attachment selected — show preview pill */
                <div className="fp-attachment-preview">
                  <span>
                    📄{" "}
                    {attachmentMode === "default"
                      ? "UvaXtreme-2026-Sponsorship-Proposal.pdf"
                      : customFile?.name}
                  </span>
                  <span className="fp-attachment-size">
                    {attachmentMode === "default"
                      ? "1.71 MB"
                      : customFile
                        ? `${(customFile.size / 1024 / 1024).toFixed(2)} MB`
                        : ""}
                  </span>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="fp-attachment-remove"
                    aria-label="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  {/* Use default PDF — no download, server reads from disk */}
                  {defaultPdfUrl && (
                    <button
                      type="button"
                      className="fp-btn fp-btn-outline"
                      onClick={selectDefaultPdf}
                      style={{ alignSelf: "flex-start", marginTop: "8px" }}
                    >
                      📎 Use Default Sponsorship Proposal PDF
                    </button>
                  )}
                  {/* Or upload custom — click triggers hidden file input */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "8px" }}>
                    <span style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
                    or upload your own
                    <span style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
                  </div>
                  <button
                    type="button"
                    className="fp-btn fp-btn-outline"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ alignSelf: "flex-start" }}
                  >
                    📁 Browse PDF…
                  </button>
                </>
              )}
            </div>



            <div className="fp-compose-actions">
              <button
                type="button"
                className="fp-btn fp-btn-primary"
                disabled={!canSend}
                onClick={() => setTab("preview")}
              >
                Preview →
              </button>
            </div>
          </div>
        )}

        {/* ── Preview Tab ──────────────────────────────────────────────────── */}
        {tab === "preview" && (
          <div className="fp-card fp-preview-card">
            <div className="fp-preview-header">
              <div className="fp-preview-row">
                <span className="fp-preview-label">From</span>
                <span>
                  {profile.full_name} &lt;{profile.domain_email}&gt;
                </span>
              </div>
              <div className="fp-preview-row">
                <span className="fp-preview-label">To</span>
                <span>{toAddress}</span>
              </div>
              {companyName && (
                <div className="fp-preview-row">
                  <span className="fp-preview-label">Company</span>
                  <span>{companyName}</span>
                </div>
              )}
              <div className="fp-preview-row">
                <span className="fp-preview-label">Subject</span>
                <span>{previewSubject}</span>
              </div>
              {attachmentMode !== "none" && (
                <div className="fp-preview-row">
                  <span className="fp-preview-label">Attachment</span>
                  <span>
                    📄{" "}
                    {attachmentMode === "default"
                      ? "UvaXtreme-2026-Sponsorship-Proposal.pdf (1.71 MB)"
                      : customFile?.name}
                    {attachmentMode === "custom" && customFile &&
                      ` (${(customFile.size / 1024 / 1024).toFixed(2)} MB)`}
                  </span>
                </div>
              )}
              <div className="fp-preview-row">
                <span className="fp-preview-label">BCC</span>
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Administrator (monitoring)
                </span>
              </div>
            </div>

            <div className="fp-preview-body" style={{ padding: 0, overflow: "hidden", borderRadius: "10px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <img
                src="https://i.imgur.com/q0XnubA.png"
                alt="UvaXtreme 2026 Sponsorship Proposal Banner"
                style={{ width: "100%", maxHeight: "240px", objectFit: "cover", display: "block" }}
              />
              <div style={{ height: "4px", background: "linear-gradient(90deg,#ea580c 0%,#f97316 50%,#fbbf24 100%)" }} />
              
              <div style={{ padding: "34px 38px 28px 38px", color: "#334155" }}>
                {(() => {
                  const normalized = previewBody.replace(/\r\n/g, "\n").trim();
                  const rawParagraphs = normalized.split(/\n\s*\n/);
                  const SIGNATURE_TRIGGER = /^(kind regards|warm regards|sincerely|best regards|regards)/i;
                  let sigIdx = rawParagraphs.length;
                  for (let i = 0; i < rawParagraphs.length; i++) {
                    const firstLine = rawParagraphs[i].trim().split("\n")[0]?.trim() || "";
                    if (SIGNATURE_TRIGGER.test(firstLine)) {
                      sigIdx = i;
                      break;
                    }
                  }
                  const bodyParas = rawParagraphs.slice(0, sigIdx);

                  return (
                    <>
                      {bodyParas.map((para, pIdx) => {
                        const trimmed = para.trim();
                        if (!trimmed) return null;
                        const lines = trimmed.split("\n");
                        const isBulletList = lines.some((l) => /^[•\-\*·]\s*/.test(l.trim()));

                        if (isBulletList) {
                          return (
                            <div
                              key={pIdx}
                              style={{
                                margin: "16px 0 20px 0",
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderLeft: "4px solid #ea580c",
                                borderRadius: "6px",
                                padding: "12px 18px",
                              }}
                            >
                              {lines.map((l, lIdx) => {
                                const clean = l.trim().replace(/^[•\-\*·]\s*/, "");
                                if (!clean) return null;
                                const colonIdx = clean.indexOf(":");
                                const hasTitle = colonIdx > 0 && colonIdx < 45;
                                const title = hasTitle ? clean.substring(0, colonIdx) : "";
                                const desc = hasTitle ? clean.substring(colonIdx + 1).trim() : clean;

                                return (
                                  <div
                                    key={lIdx}
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: "8px",
                                      margin: "5px 0",
                                      fontSize: "14.5px",
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    <span style={{ color: "#ea580c", fontSize: "16px" }}>&bull;</span>
                                    <span>
                                      {hasTitle ? (
                                        <>
                                          <strong style={{ color: "#0f172a" }}>{title}:</strong> {desc}
                                        </>
                                      ) : (
                                        desc
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        if (trimmed.endsWith(":") && trimmed.length < 60) {
                          return (
                            <p
                              key={pIdx}
                              style={{
                                margin: "22px 0 10px 0",
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: "15px",
                              }}
                            >
                              {trimmed}
                            </p>
                          );
                        }

                        if (/^dear\s/i.test(trimmed)) {
                          return (
                            <p
                              key={pIdx}
                              style={{
                                margin: "0 0 18px 0",
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: "16px",
                              }}
                            >
                              {trimmed}
                            </p>
                          );
                        }

                        return (
                          <p
                            key={pIdx}
                            style={{
                              margin: "0 0 16px 0",
                              fontSize: "15px",
                              lineHeight: 1.75,
                              color: "#334155",
                            }}
                          >
                            {trimmed}
                          </p>
                        );
                      })}

                      {/* Prestigious Signature Card */}
                      <div style={{ marginTop: "26px", paddingTop: "18px", borderTop: "1px solid #e2e8f0" }}>
                        <p style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#334155" }}>Sincerely,</p>
                        <div
                          style={{
                            backgroundColor: "#090d16",
                            borderLeft: "4px solid #ea580c",
                            borderRadius: "6px",
                            padding: "20px 24px",
                          }}
                        >
                          <div style={{ fontSize: "15.5px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.3px" }}>
                            {senderName || profile.full_name}
                          </div>
                          <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "4px" }}>
                            Finance Committee &amp; Corporate Relations &bull; UvaXtreme 2026
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                            IEEE Computer Society Student Branch Chapter &bull; Uva Wellassa University of Sri Lanka
                          </div>
                          <div
                            style={{
                              marginTop: "12px",
                              paddingTop: "10px",
                              borderTop: "1px solid #1e293b",
                              fontSize: "12.5px",
                              color: "#94a3b8",
                              lineHeight: 1.8,
                            }}
                          >
                            <span>
                              📧 Email:{" "}
                              <span style={{ color: "#f97316" }}>{senderEmail || profile.domain_email}</span>
                            </span>{" "}
                            &bull;{" "}
                            <span>
                              📞 Phone: <span style={{ color: "#e2e8f0" }}>{senderPhone}</span>
                            </span>
                            <br />
                            <span>
                              🌐 Website:{" "}
                              <a
                                href="https://uvaxtreme.dev"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#f97316", textDecoration: "none" }}
                              >
                                www.uvaxtreme.dev
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Email Footer Preview */}
              <div
                style={{
                  backgroundColor: "#020617",
                  padding: "16px 36px",
                  borderTop: "1px solid #0f172a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11.5px",
                  color: "#64748b",
                }}
              >
                <span>&copy; 2026 UvaXtreme &bull; IEEE Computer Society Student Branch &bull; UWU, Sri Lanka</span>
                <span style={{ color: "#ea580c", fontWeight: 700 }}>uvaxtreme.dev &rarr;</span>
              </div>
            </div>

            <div className="fp-compose-actions">
              <button
                type="button"
                className="fp-btn fp-btn-outline"
                onClick={() => setTab("compose")}
              >
                ← Edit
              </button>
              <button
                type="button"
                className="fp-btn fp-btn-primary"
                onClick={() => setTab("confirm")}
              >
                Confirm &amp; Send →
              </button>
            </div>
          </div>
        )}

        {/* ── Confirm Tab ──────────────────────────────────────────────────── */}
        {tab === "confirm" && (
          <div className="fp-card fp-confirm-card">
            <div className="fp-confirm-icon">🚀</div>
            <h2 className="fp-confirm-title">Ready to Send?</h2>
            <p className="fp-confirm-text">
              You are about to send a sponsorship proposal email from{" "}
              <strong>{profile.domain_email}</strong> to{" "}
              <strong>{toAddress}</strong>
              {companyName && (
                <>
                  {" "}
                  (<em>{companyName}</em>)
                </>
              )}
              .
            </p>

            {attachmentMode !== "none" && (
              <div className="fp-confirm-attachment">
                📄 Attachment:{" "}
                <strong>
                  {attachmentMode === "default"
                    ? "UvaXtreme-2026-Sponsorship-Proposal.pdf"
                    : customFile?.name}
                </strong>
                {attachmentMode === "default" && " (1.71 MB)"}
                {attachmentMode === "custom" && customFile &&
                  ` (${(customFile.size / 1024 / 1024).toFixed(2)} MB)`}
              </div>
            )}

            <div className="fp-confirm-notice">
              ⚠️ This action cannot be undone. The administrator will receive a
              BCC copy of this email.
            </div>

            {state.error && (
              <div className="fp-alert fp-alert-error" role="alert">
                <span>⚠️</span>
                <span>{state.error}</span>
              </div>
            )}

            <div className="fp-compose-actions">
              <button
                type="button"
                className="fp-btn fp-btn-outline"
                onClick={() => setTab("preview")}
                disabled={isPending}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="fp-btn fp-btn-primary"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="fp-spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "✉️ Send Email"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
