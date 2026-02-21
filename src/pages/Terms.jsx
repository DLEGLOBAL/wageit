import React from "react";
import PageHeader from "../components/common/PageHeader";

export default function Terms() {
  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Terms & Policies" backButton />
      <div className="px-4 py-6 space-y-8 text-sm text-[var(--text-muted)] leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Terms of Service</h2>
          <p>By using WageIt, you agree to abide by these terms. WageIt is a peer-to-peer challenge platform where users can create and accept skill-based, event-based, and time-based challenges. You must be 18 years or older to use this platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Responsible Wagering Policy</h2>
          <p>WageIt promotes responsible wagering. We encourage users to set personal limits and wager only what they can afford to lose. The platform implements cooldown periods for high-frequency betting and provides tools for users to manage their activity.</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>Set daily and weekly wagering limits</li>
            <li>Automatic cooldown after consecutive losses</li>
            <li>Self-exclusion options available</li>
            <li>Underage wagering is strictly prohibited</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Age Restriction</h2>
          <p>Users must be at least 18 years of age (or the legal wagering age in their jurisdiction). Age verification is required during the registration process. WageIt reserves the right to request additional identification at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Geo-Restriction</h2>
          <p>WageIt is not available in all jurisdictions. Access may be restricted based on your geographic location in compliance with local laws and regulations. It is your responsibility to ensure that your use of WageIt complies with applicable laws.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Skill-Based Wager Classification</h2>
          <p>WageIt categorizes wagers into skill-based, event-outcome, and time-based challenges. Skill-based wagers involve challenges where the outcome is predominantly determined by the participant's skill, knowledge, or physical ability. This classification may have legal implications depending on your jurisdiction.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Dispute Resolution</h2>
          <p>In the event of a dispute, funds remain locked in escrow until resolution. Our moderation team reviews all submitted evidence and makes a fair determination. Users may appeal decisions through our support channels.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Compliance Disclaimer</h2>
          <p>WageIt operates as a skill-based challenge platform. Depending on your jurisdiction, certain types of wagers may be subject to gambling regulations. WageIt does not provide legal advice. Users are responsible for ensuring compliance with their local laws. WageIt cooperates with regulatory authorities and maintains KYC (Know Your Customer) procedures.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Privacy & Data</h2>
          <p>We collect and process personal data in accordance with applicable privacy laws. Your financial information is encrypted and stored securely. We do not sell personal data to third parties. For tax purposes, transaction records may be exported in CSV format.</p>
        </section>

        <p className="text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--border)]">
          Last updated: February 2026. WageIt reserves the right to update these terms at any time.
        </p>
      </div>
    </div>
  );
}