import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable }: CardProps) {
    return (
        <div
            className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        ${hoverable ? 'hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`px-5 py-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-5 py-4 border-t border-gray-100 ${className}`}>
            {children}
        </div>
    );
}
