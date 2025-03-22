import React from 'react';

const DonationInfo = ({ showDonationInfo, toggleDonationInfo, copyToClipboard }) => {
  return (
    <>
      {showDonationInfo && (
        <div className="flex fixed inset-0 z-20 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
          <div className="p-4 w-full text-gray-800 bg-gray-100 rounded-lg shadow-lg transition-transform duration-300 ease-in-out transform scale-100 dark:bg-gray-900 dark:text-gray-200">
            <h2 className="mb-2 text-xl font-bold text-center">Donaciones (Venezuela)</h2>
            <ul className="pl-5 list-disc">
              <li>
                Banco: <b onClick={() => copyToClipboard("Bancaribe (0114)")} className="text-blue-500 cursor-pointer hover:underline">Bancaribe (0114)</b>
              </li>
              <li>
                Cuenta: <b onClick={() => copyToClipboard("01140370113700093360")} className="text-blue-500 cursor-pointer hover:underline">01140370113700093360</b>
              </li>
              <li>
                RIF: <b onClick={() => copyToClipboard("J306723072")} className="text-blue-500 cursor-pointer hover:underline">J306723072</b>
              </li>
              <li>
                Nombre: <b onClick={() => copyToClipboard("ASOCIACION CIVIL IGLESIA EVANGELICA HERMON")} className="text-blue-500 cursor-pointer hover:underline">ASOCIACION CIVIL IGLESIA EVANGELICA HERMON</b>
              </li>
            </ul>
            <button
              onClick={toggleDonationInfo}
              className="py-1 mt-4 w-full text-white bg-red-600 rounded-lg transition duration-200 hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DonationInfo;