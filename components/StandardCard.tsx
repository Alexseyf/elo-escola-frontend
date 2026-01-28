'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StandardCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function StandardCard({
    children,
    className,
    onClick,
    hoverable = false,
}: StandardCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-200 p-4 sm:p-6",
                hoverable && "hover:shadow-md hover:border-blue-100 cursor-pointer active:scale-[0.98]",
                onClick && !hoverable && "cursor-pointer active:scale-[0.98]",
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, icon: Icon, actions }: {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    actions?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Icon size={20} />
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>
            {actions && <div>{actions}</div>}
        </div>
    );
}
