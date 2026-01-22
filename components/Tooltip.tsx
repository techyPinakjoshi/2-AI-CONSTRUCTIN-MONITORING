
import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[200] px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}>
          {text}
          <div className={`absolute w-2 h-2 bg-inherit rotate-45 ${
            position === 'top' ? 'top-full -translate-y-1/2 left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'bottom-full translate-y-1/2 left-1/2 -translate-x-1/2' :
            position === 'left' ? 'left-full -translate-x-1/2 top-1/2 -translate-y-1/2' :
            'right-full translate-x-1/2 top-1/2 -translate-y-1/2'
          }`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
