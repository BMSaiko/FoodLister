import React from 'react';
import { Phone, Smartphone, Home } from 'lucide-react';

interface ContactInfoCardProps {
  phoneNumbers: string[];
  onCall?: (phoneNumber: string) => void;
}

// Helper function to detect if a number is mobile or fixed
const detectPhoneType = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  let numberWithoutCountry = cleanNumber;
  if (cleanNumber.startsWith('+351')) {
    numberWithoutCountry = cleanNumber.substring(4);
  } else if (cleanNumber.startsWith('351')) {
    numberWithoutCountry = cleanNumber.substring(3);
  }
  const areaCode = numberWithoutCountry.substring(0, 2);
  const mobileCodes = ['91', '92', '93', '96'];
  return mobileCodes.includes(areaCode) ? 'mobile' : 'landline';
};

export default function ContactInfoCard({
  phoneNumbers,
  onCall
}: ContactInfoCardProps) {
  
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4">
      <div className="flex items-center text-gray-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
        <Phone className="h-4 w-4 sm:h-5 w-5 mr-2 sm:mr-3 text-amber-500" />
        <span className="text-sm sm:text-base font-semibold">Telefones para contato</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {phoneNumbers.map((phone, index) => {
          const phoneType = detectPhoneType(phone);
          const PhoneIcon = phoneType === 'mobile' ? Smartphone : Home;

          return (
            <div
              key={index}
              className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-amber-300 transition-all duration-200 group hover:shadow-md"
            >
              <div className="flex-shrink-0 bg-white rounded-full p-2 sm:p-3 shadow-sm mr-2 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                <PhoneIcon className="h-4 w-4 sm:h-5 w-5 text-amber-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-gray-800">{phone}</span>
                  <span className="text-xs text-gray-500 bg-amber-100 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full font-medium">
                    {phoneType === 'mobile' ? 'móvel' : 'fixo'}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${phone}`}
                onClick={() => onCall?.(phone)}
                className="ml-2 sm:ml-3 p-1 sm:p-2 hover:bg-amber-100 rounded-full transition-colors group-hover:scale-110 transition-transform duration-200"
                title={`Ligar para ${phone}`}
              >
                <svg className="h-4 w-4 sm:h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
