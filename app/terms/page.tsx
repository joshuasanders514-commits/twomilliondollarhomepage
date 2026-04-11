export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: April 2026</p>

        <p className="mb-8">
          Welcome to Two Million Dollar Homepage! By using our website and purchasing pixels, you agree to these Terms of Service. Please read them carefully.
        </p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. About This Project</h2>
        <p className="mb-6">
          Two Million Dollar Homepage is operated by Noah Sanders (age 10) under parental supervision. All legal and financial matters are handled by a parent/guardian. References to "we," "us," or "our" include Noah Sanders and his parent/guardian.
        </p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. What You're Purchasing</h2>
        <p className="mb-4">When you buy pixels, you are purchasing:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>A designated space on our pixel grid</li>
          <li>The ability to display an image of your choice in that space</li>
          <li>A clickable link to a URL of your choice</li>
        </ul>
        <p className="mb-6">Pixels are sold on a first-come, first-served basis. Once a pixel location is purchased, it cannot be moved to a different location.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Pricing and Payment</h2>
        <p className="mb-6">All prices are listed in US dollars. Payment is processed securely through Stripe. By completing a purchase, you authorize us to charge your payment method for the total amount.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Refund Policy</h2>
        <p className="mb-6"><strong className="text-white">All sales are final.</strong> Due to the nature of this product (permanent placement on a limited grid), we do not offer refunds. Please be certain of your purchase before completing checkout.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Content Guidelines</h2>
        <p className="mb-4">You agree that your uploaded image and linked URL will NOT contain:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Illegal content or links to illegal activities</li>
          <li>Pornographic, sexually explicit, or adult content</li>
          <li>Hate speech, harassment, or discriminatory content</li>
          <li>Malware, phishing, or harmful links</li>
          <li>Content that infringes on others' intellectual property rights</li>
          <li>Scams, fraud, or deceptive content</li>
          <li>Violent or graphic content</li>
        </ul>
        <p className="mb-6">We reserve the right to remove any content that violates these guidelines without refund. We also reserve the right to refuse service to anyone.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Image and Link Display</h2>
        <p className="mb-6">After purchase, your image will be added to the grid within 48 hours (usually much faster). Images should be appropriate for the pixel size purchased. We may resize or crop images to fit the purchased space.</p>
        <p className="mb-6">You are responsible for ensuring you have the right to use any images or content you upload.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. Website Availability and Continuity</h2>
        <div className="bg-[#2a1a1a] border-l-4 border-red-400 p-5 rounded-r-lg mb-6">
          <p className="text-red-200"><strong className="text-red-300">Important Notice:</strong> While we intend to keep this website online indefinitely, we cannot guarantee permanent availability. The continued operation of this website depends on factors including but not limited to: sufficient revenue to cover hosting and domain costs, technical feasibility, and personal circumstances.</p>
        </div>
        <p className="mb-4">Specifically, you acknowledge and agree that:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>We reserve the right to discontinue the website if the project does not generate sufficient revenue to sustain ongoing costs</li>
          <li>Domain registration and hosting require ongoing payment; if the project is not financially viable, these services may not be renewed</li>
          <li>We will make reasonable efforts to notify pixel owners via email before any planned discontinuation</li>
          <li>In the event of discontinuation, we will attempt to provide pixel owners with a final archive/snapshot of the grid</li>
          <li>No refunds will be issued if the website is discontinued after your pixels have been displayed</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. NFT Conversion</h2>
        <div className="bg-[#1a2a1a] border-l-4 border-green-400 p-5 rounded-r-lg mb-6">
          <p className="text-green-200 mb-3"><strong className="text-green-300">Potential Future Benefit:</strong> If and only if all 100,000 pixels are sold (the grid is completely sold out), we intend to convert the completed pixel grid into an NFT (Non-Fungible Token) as a commemorative digital collectible.</p>
          <p className="text-green-200 mb-2">You acknowledge and agree that:</p>
          <ul className="list-disc pl-6 space-y-1 text-green-200">
            <li>NFT conversion is NOT guaranteed and is contingent upon selling out the entire grid</li>
            <li>The decision to create an NFT, the blockchain used, and all details are at our sole discretion</li>
            <li>Purchasing pixels does not grant you any ownership rights to any potential NFT</li>
            <li>This is a potential future project, not a promise or part of your pixel purchase</li>
          </ul>
        </div>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Intellectual Property</h2>
        <p className="mb-6">You retain rights to content you upload. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to display your image and link on our website and in any promotional materials.</p>
        <p className="mb-6">The Two Million Dollar Homepage name, logo, and website design are our property.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Limitation of Liability</h2>
        <p className="mb-4">To the maximum extent permitted by law:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>We provide this website "as is" without warranties of any kind</li>
          <li>We are not liable for any indirect, incidental, or consequential damages</li>
          <li>Our total liability is limited to the amount you paid for your pixels</li>
          <li>We are not responsible for third-party websites linked from the grid</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. Disputes</h2>
        <p className="mb-6">Any disputes arising from these terms or your use of the website will be governed by the laws of the United States. You agree to attempt to resolve any disputes informally by contacting us first.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">12. Changes to Terms</h2>
        <p className="mb-6">We may update these Terms of Service from time to time. Continued use of the website after changes constitutes acceptance of the new terms. We will notify pixel owners of significant changes via email when possible.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4">13. Contact</h2>
        <p className="mb-2">For questions about these Terms of Service, contact us at:</p>
        <p className="mb-8"><a href="mailto:joshuasanders514@gmail.com" className="text-blue-400 hover:text-blue-300">joshuasanders514@gmail.com</a></p>

        <div className="bg-[#1a1a2e] border-l-4 border-blue-500 p-5 rounded-r-lg">
          <p className="text-gray-300">By purchasing pixels on Two Million Dollar Homepage, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}