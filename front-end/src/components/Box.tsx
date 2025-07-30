import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, className = '', style, onClick, onScroll, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={style}
        onClick={onClick}
        onScroll={onScroll}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Box.displayName = 'Box';

export default Box; 