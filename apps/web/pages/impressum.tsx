import React from 'react';

const Impressum = () => {
  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">Impressum</h2>
      <p className="text-gray-700">
        Üshop GmbH
        <br>Musterstraße 123
        <br>12345 Musterstadt
        <br>VAT ID: DE123456789
        <br>Registered in theVR: VR12345678
        <br>Responsible Person: Jan Doerner
        <br>Contact: jan.doe@ushop.com | +49 123 456 7890
      </p>
      <p className="mt-8 text-sm text-gray-600">
        For legal inquiries regarding the operation of this platform, please contact us at the address above.
      </p>
    </div>
  );
};

export default Impressum;
