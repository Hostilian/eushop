import React from 'react';

const Impressum = () => {
  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Impressum / Legal Notice</h1>
      <p className="text-gray-700 leading-relaxed">
        <strong>Information according to § 5 TMG / DSA Art. 30:</strong>
        <br />
        EUshop Marketplace B.V.
        <br />
        Musterstraße 123
        <br />
        12345 Musterstadt, Germany
        <br />
        VAT ID: DE123456789 (Placeholder - Pending Registration)
        <br />
        Commercial Register: HRB 123456 (Local Court Musterstadt)
        <br />
        Responsible Person: Jan Doerner (Managing Director)
        <br />
        Contact: jan.doe@eushop.eu | +49 123 456 7890
      </p>
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-2">Dispute Resolution</h2>
        <p className="text-sm text-gray-600">
          The European Commission provides a platform for online dispute resolution (ODR):{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <h2 className="text-xl font-semibold mt-4 mb-2">Regulatory & Supervisory Authority</h2>
        <p className="text-sm text-gray-600">
          Supervisory Authority for Data Protection: Úřad pro ochranu osobních údajů (ÚOOÚ) / State Data Protection Authorities.
        </p>
      </div>
    </div>
  );
};

export default Impressum;
