import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';
import { StethoscopeIcon } from '../icons/StethoscopeIcon';

interface HeaderProps {
  onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <StethoscopeIcon className="w-8 h-8 text-primary"/>
           <h1 className="text-2xl font-bold text-dark">
             Medi<span className="text-primary">Book</span>
           </h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-600 hidden sm:block">Welcome, {user.name}</span>
              <Button onClick={logout} variant="secondary" className="px-3 py-1.5 text-sm">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={onLoginClick} className="px-4 py-2 text-sm">
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;