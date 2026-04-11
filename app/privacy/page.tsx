export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: April 2026</p>

        <p className="mb-8">
          Two Million Dollar Homepage ("we," "us," or "our") is operated by Noah Sanders with parental oversight. This Privacy Policy explains how we collect, use, and protect your information when you use our website at twomilliondollarhomepage.io.
        </p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Information We Collect</h2>
        <p className="mb-4">When you purchase pixels on our site, we collect:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong className="text-white">Contact Information:</strong> Your email address to send purchase confirmations and important updates about your pixels</li>
          <li><strong className="text-white">Payment Information:</strong> Processed securely through Stripe. We do not store your credit card numbers on our servers.</li>
          <li><strong className="text-white">Pixel Content:</strong> The image and URL you provide for your purchased pixel space</li>
          <li><strong className="text-white">Transaction Records:</strong> Purchase date, amount, and pixel location for our records</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Process your pixel purchase and display your image/link on the grid</li>
          <li>Send you confirmation of your purchase</li>
          <li>Contact you about important updates regarding the website or your pixels</li>
          <li>Respond to your questions or support requests</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Information Sharing</h2>
        <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong className="text-white">Payment Processing:</strong> Stripe receives your payment information to process transactions securely</li>
          <li><strong className="text-white">Legal Requirements:</strong> If required by law or to protect our rights</li>
          <li><strong className="text-white">Public Display:</strong> The image and link you provide will be publicly visible on the pixel grid (this is the product you're purchasing)</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Cookies and Analytics</h2>
        <p className="mb-4">We may use cookies and similar technologies to:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Remember your preferences</li>
          <li>Understand how visitors use our site</li>
          <li>Improve our website experience</li>
        </ul>
        <p className="mb-6">You can disable cookies in your browser settings, though some features may not work properly.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Data Security</h2>
        <p className="mb-6">We take reasonable measures to protect your information. Payment processing is handled by Stripe, which maintains PCI-DSS compliance. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Children's Privacy</h2>
        <p className="mb-6">While our website operator is a minor (with parental oversight), we do not knowingly collect personal information from children under 13 without parental consent. If you believe a child has provided us with personal information, please contact us.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Your Rights</h2>
        <p className="mb-4">You may request to:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Access the personal information we have about you</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information (note: this does not apply to purchased pixel space, which is non-refundable)</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Data Retention</h2>
        <div className="bg-[#1a1a2e] border-l-4 border-blue-500 p-5 rounded-r-lg mb-6">
          <p className="text-gray-300">We retain your information for as long as the website remains operational. Please see our Terms of Service for important information about website continuity and data preservation.</p>
        </div>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Changes to This Policy</h2>
        <p className="mb-6">We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">Contact Us</h2>
        <p className="mb-2">If you have questions about this Privacy Policy, please contact us at:</p>
        <p><a href="mailto:joshuasanders514@gmail.com" className="text-blue-400 hover:text-blue-300">joshuasanders514@gmail.com</a></p>
      </div>
    </div>
  );
}