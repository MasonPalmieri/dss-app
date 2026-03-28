import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <span className="font-bold text-lg cursor-pointer">
              Draft<span className="text-[#c8210d]">Send</span>Sign
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Effective Date: March 25, 2026</p>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-10">
          DraftSendSign, Inc. ("DraftSendSign," "we," "us," or "our") is committed to protecting
          your privacy. This Privacy Policy describes how we collect, use, store, and disclose
          information when you use our electronic signature platform (the "Service"). By using the
          Service, you agree to the practices described in this policy.
        </p>

        <div className="space-y-10 text-sm leading-relaxed">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">
              We collect the following categories of information when you use DraftSendSign:
            </p>
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground mb-1">Account Information</p>
                <p className="text-muted-foreground">
                  When you register, we collect your full name, email address, company name (if
                  provided), and password (stored in hashed form). We may also collect billing
                  information processed through our payment provider.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground mb-1">Document Content</p>
                <p className="text-muted-foreground">
                  Documents uploaded to or created through the Service, along with associated
                  metadata such as titles, recipient names, email addresses, signature field data,
                  and completed signatures. Recipient information you provide is used solely to
                  facilitate the signing process.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground mb-1">Usage Data</p>
                <p className="text-muted-foreground">
                  We automatically collect information about how you interact with the Service,
                  including pages visited, features used, actions taken, browser type, operating
                  system, and session duration.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground mb-1">IP Addresses and Device Information</p>
                <p className="text-muted-foreground">
                  We collect IP addresses for security purposes, fraud prevention, and to maintain
                  audit trails for electronically executed documents as required by the ESIGN Act.
                  Device identifiers and browser fingerprinting data may also be collected as part
                  of the signing audit trail.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Provide the Service:</strong> Process documents,
                facilitate signature collection, and deliver the core functionality of the platform
              </li>
              <li>
                <strong className="text-foreground">Send Notifications:</strong> Deliver transactional
                emails such as signature requests, signing confirmations, and account-related notices
              </li>
              <li>
                <strong className="text-foreground">Compliance and Legal Obligations:</strong> Maintain
                audit trails as required by applicable electronic signature laws, respond to legal
                requests, and enforce our Terms of Service
              </li>
              <li>
                <strong className="text-foreground">Security and Fraud Prevention:</strong> Monitor for
                suspicious activity, protect the integrity of the Service, and prevent unauthorized
                access
              </li>
              <li>
                <strong className="text-foreground">Service Improvement:</strong> Analyze usage patterns
                to improve features, performance, and user experience
              </li>
              <li>
                <strong className="text-foreground">Customer Support:</strong> Respond to your inquiries
                and resolve issues with the Service
              </li>
            </ul>
          </section>

          <Separator />

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">3. Document Storage and Security</h2>
            <p className="text-muted-foreground">
              Documents and associated data are stored on secure infrastructure operated by Supabase
              and backed by Amazon Web Services (AWS). All data is encrypted at rest using
              AES-256 encryption and encrypted in transit using TLS 1.2 or higher.
            </p>
            <p className="text-muted-foreground mt-3">
              Access to stored documents is restricted to the account holder, designated recipients
              for signing purposes, and DraftSendSign personnel on a strict need-to-know basis.
              We do not sell, rent, or otherwise commercially exploit the content of your documents.
            </p>
            <p className="text-muted-foreground mt-3">
              Physical security of our hosting infrastructure is maintained by AWS and Supabase in
              accordance with their respective security certifications, including SOC 2 Type II
              and ISO 27001.
            </p>
          </section>

          <Separator />

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">4. Email Communications</h2>
            <p className="text-muted-foreground">
              DraftSendSign uses Resend (resend.com) to send transactional emails, including
              signature request notifications, completion confirmations, and account communications.
              By using the Service, you consent to receive these transactional emails.
            </p>
            <p className="text-muted-foreground mt-3">
              We do not send unsolicited marketing emails without your explicit consent. Transactional
              emails directly related to your use of the Service (e.g., signature requests you have
              initiated) cannot be opted out of, as they are necessary to deliver the core Service.
            </p>
          </section>

          <Separator />

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your account information and documents for as long as your account remains
              active and for a reasonable period thereafter to comply with legal obligations,
              resolve disputes, and enforce our agreements.
            </p>
            <p className="text-muted-foreground mt-3">
              Audit trail records associated with executed documents are retained for a minimum of
              seven (7) years to support the legal enforceability of electronically signed agreements.
              Upon account deletion, your personal data is removed from active systems within 30 days,
              subject to legal retention requirements.
            </p>
          </section>

          <Separator />

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground mb-3">
              Depending on your location, you may have the following rights with respect to your
              personal data:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c8210d] mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Access</p>
                  <p className="text-muted-foreground">
                    Request a copy of the personal data we hold about you.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c8210d] mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Deletion</p>
                  <p className="text-muted-foreground">
                    Request deletion of your personal data, subject to legal retention requirements
                    and our legitimate interests.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c8210d] mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Portability</p>
                  <p className="text-muted-foreground">
                    Request a machine-readable export of your account data and documents.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c8210d] mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Correction</p>
                  <p className="text-muted-foreground">
                    Request correction of inaccurate personal data we hold about you.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mt-4">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:help@draftsendsign.com" className="text-[#c8210d] hover:underline">
                help@draftsendsign.com
              </a>
              . We will respond to verified requests within 30 days.
            </p>
          </section>

          <Separator />

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground">
              DraftSendSign uses minimal cookies. We use session cookies, which are temporary
              and deleted when you close your browser, to maintain your authenticated session
              and preserve application state. We do not use persistent tracking cookies or
              third-party advertising cookies.
            </p>
            <p className="text-muted-foreground mt-3">
              You can configure your browser to refuse cookies, but doing so may affect your ability
              to use certain features of the Service, including staying logged in.
            </p>
          </section>

          <Separator />

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">8. Third-Party Services</h2>
            <p className="text-muted-foreground mb-3">
              We work with the following third-party service providers to deliver the Service. Each
              has their own privacy policy governing their processing of data:
            </p>
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground">Supabase</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Database, authentication, and file storage infrastructure. Supabase processes
                  account data, document files, and session information on our behalf.
                  Privacy policy: supabase.com/privacy
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground">Resend</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Transactional email delivery service. Resend processes recipient email addresses
                  and email content to deliver notifications on our behalf.
                  Privacy policy: resend.com/legal/privacy-policy
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4">
              We do not sell your personal data to third parties. We share information with service
              providers only as necessary to operate the Service, and require them to maintain the
              confidentiality and security of such information.
            </p>
          </section>

          <Separator />

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">9. International Data Transfers</h2>
            <p className="text-muted-foreground">
              DraftSendSign is based in the United States. If you use the Service from outside the
              United States, your information may be transferred to and processed in the United
              States or other countries where our service providers operate. By using the Service,
              you consent to such transfers.
            </p>
          </section>

          <Separator />

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically to reflect changes in our practices or
              applicable law. We will notify you of material changes by email or by posting a notice
              within the Service. Your continued use of the Service after the effective date of the
              revised policy constitutes your acceptance of the changes.
            </p>
          </section>

          <Separator />

          {/* Section 11 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">11. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related questions, requests, or concerns, please contact us at:
            </p>
            <div className="mt-3 rounded-lg border bg-muted/30 p-4 text-muted-foreground">
              <p className="font-medium text-foreground">DraftSendSign, Inc. — Privacy</p>
              <p className="mt-1">
                Email:{" "}
                <a href="mailto:help@draftsendsign.com" className="text-[#c8210d] hover:underline">
                  help@draftsendsign.com
                </a>
              </p>
              <p>State of Incorporation: Delaware, USA</p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 DraftSendSign, Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms">
              <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            </Link>
            <Link href="/privacy">
              <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
