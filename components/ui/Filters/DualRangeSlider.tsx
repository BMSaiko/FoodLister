import React, { useState, useRef, useEffect } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  label: string;
  unit?: string;
  className?: string;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  label,
  unit = '',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const minHandleRef = useRef<HTMLDivElement>(null);
  const maxHandleRef = useRef<HTMLDivElement>(null);

  // Calculate percentage position for handles
  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleMouseDown = (type: 'min' | 'max') => {
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const clickX = e.clientX - sliderRect.left;
    
    // Calculate percentage
    let percentage = (clickX / sliderWidth) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    // Calculate value
    const range = max - min;
    let newValue = Math.round((percentage / 100) * range + min);
    
    // Apply step
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }

    // Ensure step constraints
    newValue = Math.max(min, Math.min(max, newValue));

    // Update values based on which handle is being dragged
    if (isDragging === 'min') {
      // Ensure min doesn't exceed max
      const newMin = Math.min(newValue, value.max);
      onChange({ ...value, min: newMin });
    } else {
      // Ensure max doesn't go below min
      const newMax = Math.max(newValue, value.min);
      onChange({ ...value, max: newMax });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Add event listeners for drag functionality
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, value]);

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent, type: 'min' | 'max') => {
    const delta = e.shiftKey ? step * 10 : step;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = type === 'min' 
        ? Math.min(value.min + delta, value.max)
        : Math.min(value.max + delta, max);
      
      onChange(type === 'min' 
        ? { ...value, min: newValue }
        : { ...value, max: newValue }
      );
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = type === 'min'
        ? Math.max(value.min - delta, min)
        : Math.max(value.max - delta, value.min);
      
      onChange(type === 'min'
        ? { ...value, min: newValue }
        : { ...value, max: newValue }
      );
    }
  };

  const minPercentage = getPercentage(value.min);
  const maxPercentage = getPercentage(value.max);

  return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-[var(--foreground-secondary)]">{label}</label>
          <span className="text-sm text-[var(--foreground-muted)]">
            {value.min}{unit} - {value.max}{unit}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="relative" ref={sliderRef}>
            {/* Track background */}
            <div className="w-full h-2 bg-[var(--background-secondary)] rounded-full shadow-inner"></div>
            
            {/* Selected range */}
            {(() => {
              const leftPos = Math.max(0, Math.min(100, minPercentage));
              const rightPos = Math.max(0, Math.min(100, maxPercentage));
              const width = Math.max(0, rightPos - leftPos);
              return (
                <div 
                  className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-full shadow-md"
                  style={{
                    left: `${leftPos}%`,
                    width: `${width}%`
                  }}
                ></div>
              );
            })()}
            
            {/* Min Handle */}
            <div
              ref={minHandleRef}
              className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-[var(--primary)] border-2 border-[var(--card-bg)] rounded-full cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-200 ${
                isDragging === 'min' ? 'ring-4 ring-[var(--primary-light)]/60 scale-110' : ''
              }`}
              style={{
                left: `${Math.max(0, Math.min(100, minPercentage))}%`,
                marginLeft: '-10px',
                zIndex: 10,
                maxWidth: '100%',
                overflow: 'visible'
              }}
              onMouseDown={() => handleMouseDown('min')}
              onKeyDown={(e) => handleKeyDown(e, 'min')}
              tabIndex={0}
              role="slider"
              aria-label={`Mínimo ${label}`}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={value.min}
              aria-valuetext={`${value.min}${unit}`}
            >
              <div className="absolute inset-0 rounded-full bg-[var(--card-bg)]/20"></div>
            </div>
            
            {/* Max Handle */}
            <div
              ref={maxHandleRef}
              className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-[var(--primary)] border-2 border-[var(--card-bg)] rounded-full cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-200 ${
                isDragging === 'max' ? 'ring-4 ring-[var(--primary-light)]/60 scale-110' : ''
              }`}
              style={{
                left: `${Math.max(0, Math.min(100, maxPercentage))}%`,
                marginLeft: '-10px',
                zIndex: 10,
                maxWidth: '100%',
                overflow: 'visible'
              }}
              onMouseDown={() => handleMouseDown('max')}
              onKeyDown={(e) => handleKeyDown(e, 'max')}
              tabIndex={0}
              role="slider"
              aria-label={`Máximo ${label}`}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={value.max}
              aria-valuetext={`${value.max}${unit}`}
            >
              <div className="absolute inset-0 rounded-full bg-[var(--card-bg)]/20"></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-[var(--foreground-muted)] font-medium">
            <span className="text-[var(--primary-dark)]">{value.min}{unit}</span>
            <span className="text-[var(--primary-dark)]">{value.max}{unit}</span>
          </div>
        </div>
      </div>
  );
};

export default DualRangeSlider;