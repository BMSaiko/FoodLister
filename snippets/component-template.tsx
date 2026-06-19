// ============================================
// Server Component Template
// ============================================
// components/[category]/ComponentName.tsx

interface ComponentNameProps {
  className?: string;
}

export default function ComponentName({ className = '' }: ComponentNameProps) {
  return (
    <div className={className}>
      {/* Component content */}
    </div>
  );
}

// ============================================
// Client Component Template
// ============================================
// components/[category]/ComponentName.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ComponentNameProps {
  className?: string;
}

export default function ComponentName({ className = '' }: ComponentNameProps) {
  const [state, setState] = useState();

  const handleAction = useCallback(() => {
    // Action logic
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {/* Component content */}
    </motion.div>
  );
}

// ============================================
// Component with Variants Template
// ============================================
// components/ui/ComponentName.tsx

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ComponentNameProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-white hover:bg-secondary/90',
  outline: 'border-2 border-primary text-primary hover:bg-primary/10',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function ComponentName({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: ComponentNameProps) {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================
// Component with Loading/Error States
// ============================================
// components/[category]/ComponentName.tsx
'use client';

import { useState, useEffect } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import Error from '@/components/ui/Error';

interface DataItem {
  id: string;
  name: string;
}

interface ComponentNameProps {
  className?: string;
}

export default function ComponentName({ className = '' }: ComponentNameProps) {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        // Fetch logic
        setData([]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Skeleton count={3} />;
  if (error) return <Error message={error.message} retry={() => window.location.reload()} />;

  return (
    <div className={className}>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}