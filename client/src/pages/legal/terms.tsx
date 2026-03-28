import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Effective Date: March 25, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-sm leading-relaxed">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using DraftSendSign ("Service," "we," "us," or "our"), you agree to be
              bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms,
              do not use the Service. These Terms constitute a legally binding agreement between you
              and DraftSendSign, Inc., a Delaware corporation.
            </p>
            <p className="text-muted-foreground mt-3">
              We may update these Terms from time to time. Continued use of the Service after changes
              take effect constitutes acceptance of the revised Terms. We will provide notice of
              material changes via email or a prominent notice within the Service.
            </p>
          </section>

          <Separator />

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">
              DraftSendSign is a cloud-based electronic signature platform that enables users to
              prepare, send, sign, and manage legally binding documents electronically. The Service
              is designed to comply with the Electronic Signatures in Global and National Commerce
              Act (ESIGN Act, 15 U.S.C. § 7001 et seq.) and applicable state electronic signature
              laws, including the Uniform Electronic Transactions Act (UETA).
            </p>
            <p className="text-muted-foreground mt-3">
              Electronic signatures executed through DraftSendSign carry the same legal weight as
              handwritten signatures where permitted by applicable law. The Service includes document
              upload, recipient management, field placement, automated signature collection, audit
              trail logging, and document storage.
            </p>
          </section>

          <Separator />

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">3. User Accounts and Registration</h2>
            <p className="text-muted-foreground">
              To access the Service, you must register for an account by providing accurate and
              complete information. You are responsible for maintaining the confidentiality of your
              account credentials and for all activity that occurs under your account.
            </p>
            <p className="text-muted-foreground mt-3">
              You agree to immediately notify us of any unauthorized use of your account at
              help@draftsendsign.com. We reserve the right to suspend or terminate accounts that
              violate these Terms, engage in fraudulent activity, or remain inactive for an extended
              period. You must be at least 18 years old to create an account.
            </p>
          </section>

          <Separator />

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">4. Electronic Signatures</h2>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Legal Validity.</strong> By using the electronic
              signature features of the Service, you agree that your electronic signature constitutes
              your legally binding signature to the fullest extent permitted by applicable law,
              including the ESIGN Act. Electronic signatures facilitated through DraftSendSign are
              intended to be legally equivalent to handwritten signatures.
            </p>
            <p className="text-muted-foreground mt-3">
              <strong className="text-foreground">Consent to Electronic Signatures.</strong> Before
              signing a document through DraftSendSign, each signer is presented with a consent
              notice that clearly states the legally binding nature of their electronic signature.
              By proceeding to sign, each signer affirmatively consents to conduct the transaction
              electronically and to use electronic signatures.
            </p>
            <p className="text-muted-foreground mt-3">
              <strong className="text-foreground">Audit Trail.</strong> The Service records an audit
              trail for each signature event, including the signer's IP address, timestamp, and
              device information. This audit trail is maintained to support the enforceability of
              electronically executed documents.
            </p>
            <p className="text-muted-foreground mt-3">
              <strong className="text-foreground">User Responsibility.</strong> Senders are
              responsible for ensuring they have the legal authority to request electronic signatures
              and that the documents sent for signature are accurate and lawful. DraftSendSign makes
              no representations regarding the enforceability of any particular agreement signed
              through the Service.
            </p>
          </section>

          <Separator />

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">5. Document Storage and Security</h2>
            <p className="text-muted-foreground">
              Documents uploaded to or created through the Service are stored on secure infrastructure
              provided by our hosting partners. We implement industry-standard security measures,
              including encryption at rest and in transit, to protect your documents.
            </p>
            <p className="text-muted-foreground mt-3">
              While we take reasonable precautions to safeguard your data, no security system is
              impenetrable. You acknowledge that you upload and store documents at your own risk. We
              recommend maintaining independent copies of any critical documents. We are not
              responsible for the loss of any documents due to technical failures, user error, or
              circumstances beyond our reasonable control.
            </p>
          </section>

          <Separator />

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">6. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You agree to use the Service only for lawful purposes and in compliance with all
              applicable laws and regulations. You may not use the Service to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1.5">
              <li>Forge, falsify, or misrepresent any documents or signatures</li>
              <li>Send unsolicited or fraudulent signature requests</li>
              <li>Violate any intellectual property rights of any party</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to the Service or its infrastructure</li>
              <li>Use the Service in any way that could damage, disable, or impair the platform</li>
              <li>Engage in any activity that violates applicable laws, including anti-spam laws</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We reserve the right to investigate suspected violations and, where appropriate,
              involve law enforcement authorities.
            </p>
          </section>

          <Separator />

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">7. Payment Terms</h2>
            <p className="text-muted-foreground">
              Subscription plans are available for the Service. Pricing, billing cycles, and plan
              details are described on the{" "}
              <Link href="/pricing">
                <span className="text-[#c8210d] hover:underline cursor-pointer">Pricing page</span>
              </Link>
              . By subscribing, you authorize us to charge the applicable fees to your designated
              payment method.
            </p>
            <p className="text-muted-foreground mt-3">
              All fees are non-refundable except as required by applicable law or as expressly stated
              in our refund policy. We reserve the right to modify pricing with reasonable advance
              notice to existing subscribers. Failure to pay may result in suspension or termination
              of your account.
            </p>
          </section>

          <Separator />

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">8. Privacy</h2>
            <p className="text-muted-foreground">
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy">
                <span className="text-[#c8210d] hover:underline cursor-pointer">Privacy Policy</span>
              </Link>
              , which is incorporated into these Terms by reference. By using the Service, you
              consent to the collection and use of your information as described in the Privacy
              Policy. Please review our Privacy Policy carefully before using the Service.
            </p>
          </section>

          <Separator />

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">9. Intellectual Property</h2>
            <p className="text-muted-foreground">
              DraftSendSign and all related marks, logos, and product names are the intellectual
              property of DraftSendSign, Inc. All rights reserved. You retain full ownership of
              the documents and content you upload or create through the Service. By using the
              Service, you grant us a limited, non-exclusive, royalty-free license to host,
              process, and transmit your content solely to provide the Service to you.
            </p>
          </section>

          <Separator />

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DRAFTSENDSIGN, INC. AND ITS
              OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS,
              DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY TO USE THE
              SERVICE.
            </p>
            <p className="text-muted-foreground mt-3">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO
              THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE TWELVE (12)
              MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100). SOME JURISDICTIONS DO
              NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION OF LIABILITY, SO SOME OF
              THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
            </p>
          </section>

          <Separator />

          {/* Section 11 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">11. Disclaimers</h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF
              ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR ENTIRELY SECURE.
            </p>
          </section>

          <Separator />

          {/* Section 12 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">12. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the State
              of Delaware, without regard to its conflict of law provisions. Any disputes arising
              under or in connection with these Terms shall be subject to the exclusive jurisdiction
              of the state and federal courts located in the State of Delaware. You consent to
              personal jurisdiction in such courts.
            </p>
            <p className="text-muted-foreground mt-3">
              Any dispute that cannot be resolved informally shall be settled by binding arbitration
              under the rules of the American Arbitration Association. This section does not prevent
              either party from seeking injunctive or other equitable relief in court for matters
              requiring immediate relief.
            </p>
          </section>

          <Separator />

          {/* Section 13 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">13. Termination</h2>
            <p className="text-muted-foreground">
              You may terminate your account at any time by contacting us at help@draftsendsign.com
              or through your account settings. We may terminate or suspend your access at any time,
              with or without cause, and with or without notice. Upon termination, your right to use
              the Service ceases immediately.
            </p>
          </section>

          <Separator />

          {/* Section 14 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">14. Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 rounded-lg border bg-muted/30 p-4 text-muted-foreground">
              <p className="font-medium text-foreground">DraftSendSign, Inc.</p>
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
