export default function BecomeSeller() {
  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">Become a Seller</h2>
      <p className="mt-4 text-gray-700">Start selling your regional specialty foods, pantry staples, or candies to EU customers. Complete the steps below to verify your business and launch your shop.</p>

      {/* Step 1: Seller Registration Form (Sellar will handle later) */}
      {/* Step 2: KYC Verification */}
      {/* To be implemented as Formik-based form with validation rules: */}
      {/* - Business name / trade name */}
      {/* - VAT ID or tax registration number */}
      {/* - Business address + contact person */}
      {/* - Identity verification upload (passport/CKimberley) */}
      {/* - Bank account details for payouts */}
      {/* - Product category selection (food/retail/other) */}
      {/* - Demo product upload (optional but recommended) */}
      
      {/* Step 3: Compliance Confirmation */}
      <h3 className="mt-8 text-lg font-semibold">GDPR/DSC Compliance Acknowledgment</h3>
      <p className="text-gray-700 mt-2">By clicking continue, you acknowledge compliance with GDPR (data subject rights), DSA (verified seller status), and EU digital regulations. Jan Doerner (EUshop Compliance Officer) will contact you for formal verification.</p>

      {/* Step 4: Final Review */}
      <button className="mt-8 bg-brand-green text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition">Continue to Review</button>
    </div>
  );
}
