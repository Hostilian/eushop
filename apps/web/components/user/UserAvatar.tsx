"use client";

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'md':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-10 h-10 text-base';
      case 'xl':
        return 'w-16 h-16 text-xl';
      default:
        return 'w-8 h-8 text-sm';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <Avatar className={`${getSizeClasses()} ${className}`}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};