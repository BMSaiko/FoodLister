import React from 'react';

const RestaurantImagePlaceholder = ({
  className = "",
  iconSize = "48",
  showText = true,
  textSize = "text-sm",
  iconColor = "text-amber-600",
  textColor = "text-amber-700"
}) => {
  return (
    <div className={`w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        {/* Logo SVG baseado no logo da app */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconColor}
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>

        {/* Texto do placeholder */}
        {showText && (
          <span className={`${textColor} font-medium ${textSize} text-center px-2`}>
            Sem imagem
          </span>
        )}
      </div>
    </div>
  );
};

export default RestaurantImagePlaceholder;
