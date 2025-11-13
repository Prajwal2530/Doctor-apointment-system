
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover focus:ring-primary',
    secondary: 'bg-secondary hover:bg-gray-600 focus:ring-secondary',
    danger: 'bg-danger hover:bg-red-700 focus:ring-danger',
    success: 'bg-success hover:bg-green-700 focus:ring-success',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
