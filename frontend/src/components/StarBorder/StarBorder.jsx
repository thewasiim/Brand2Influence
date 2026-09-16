import React from 'react';
import './StarBorder.css';

export const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#FFFFFF',
  speed = '6s',
  thickness = 1,
  backgroundColor = '#0A0A0A',
  textColor = '#FFFFFF',
  borderColor = 'rgba(255, 255, 255, 0.15)',
  children,
  style = {},
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`.trim()}
      style={{
        padding: `${thickness}px`,
        ...style,
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div
        className="inner-content"
        style={{
          background: backgroundColor,
          color: textColor,
          borderColor: borderColor,
        }}
      >
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
