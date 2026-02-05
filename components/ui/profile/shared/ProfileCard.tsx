import React from 'react';
import { Star, Utensils, Clock, MapPin, Euro, DollarSign, Users, List as ListIcon } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface ProfileCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  touchTarget?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  children,
  className = '',
  href,
  onClick,
  hoverEffect = true,
  touchTarget = false
}) => {
  const baseClasses = `
    bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200
    transition-all duration-200 group
    ${hoverEffect ? 'hover:shadow-md hover:shadow-amber-100/50 hover:-translate-y-1' : ''}
    ${touchTarget ? 'min-h-[60px] min-w-[60px]' : ''}
  `;

  const content = (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="block w-full text-left"
        disabled={!onClick}
      >
        {content}
      </button>
    );
  }

  return content;
};

interface MetadataItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MetadataItem: React.FC<MetadataItemProps> = ({ icon, children, className = '' }) => (
  <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
    {icon}
    <span className="text-sm font-medium text-gray-700">{children}</span>
  </div>
);

interface RatingBadgeProps {
  rating: number;
  type?: 'restaurant' | 'review';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, type = 'restaurant' }) => (
  <div className="flex items-center gap-1">
    <Star className={`h-4 w-4 ${type === 'review' ? 'text-amber-500 fill-current' : 'text-orange-500'}`} />
    <span className="font-semibold">{rating.toFixed(1)}/5</span>
  </div>
);

interface PriceLevelBadgeProps {
  priceLevel?: number;
}

export const PriceLevelBadge: React.FC<PriceLevelBadgeProps> = ({ priceLevel }) => {
  if (!priceLevel) return null;
  
  return (
    <div className="flex items-center gap-1">
      <DollarSign className="h-4 w-4 text-green-600" />
      <span className="text-sm font-medium text-gray-700">
        {'$'.repeat(priceLevel)}
      </span>
    </div>
  );
};

interface LocationBadgeProps {
  location: string;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({ location }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-700">
    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
    {location}
  </span>
);

interface CuisineBadgeProps {
  cuisineType: string;
}

export const CuisineBadge: React.FC<CuisineBadgeProps> = ({ cuisineType }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-orange-100 text-orange-700">
    <Utensils className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
    {cuisineType}
  </span>
);

interface DateBadgeProps {
  date: string;
  prefix?: string;
}

export const DateBadge: React.FC<DateBadgeProps> = ({ date, prefix = 'Adicionado em' }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-700">
    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
    {prefix} {formatDate(date)}
  </span>
);

interface RestaurantCountBadgeProps {
  count: number;
  icon?: React.ReactNode;
}

export const RestaurantCountBadge: React.FC<RestaurantCountBadgeProps> = ({ count, icon }) => (
  <div className="bg-white rounded-lg px-3 py-1 border border-gray-200">
    <span className="text-sm font-medium text-gray-700">
      {icon || <Utensils className="h-4 w-4 inline mr-1" />}
      {count} {count === 1 ? 'restaurante' : 'restaurantes'}
    </span>
  </div>
);

interface AmountBadgeProps {
  amount?: number;
}

export const AmountBadge: React.FC<AmountBadgeProps> = ({ amount }) => {
  if (!amount) return null;
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="flex items-center gap-1">
      <Euro className="h-4 w-4" />
      <span>{formatAmount(amount)}</span>
    </div>
  );
};

interface ListIconBadgeProps {
  count: number;
}

export const ListIconBadge: React.FC<ListIconBadgeProps> = ({ count }) => (
  <div className="bg-amber-500 text-white p-2 rounded-lg">
    <ListIcon className="h-5 w-5" />
  </div>
);

interface UserIconBadgeProps {
  count: number;
}

export const UserIconBadge: React.FC<UserIconBadgeProps> = ({ count }) => (
  <div className="bg-blue-500 text-white p-2 rounded-lg">
    <Users className="h-5 w-5" />
  </div>
);