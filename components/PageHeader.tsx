'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string | (() => void);
    actions?: React.ReactNode;
    className?: string;
    sticky?: boolean;
}

export function PageHeader({
    title,
    subtitle,
    backHref,
    actions,
    className,
    sticky = true,
}: PageHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (typeof backHref === 'function') {
            backHref();
        } else if (typeof backHref === 'string') {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <header
            className={cn(
                "bg-white border-b border-gray-100 px-4 py-3 sm:px-6 flex flex-col gap-1 w-full",
                sticky && "sticky top-0 z-20 shadow-sm",
                className
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                    {(backHref !== undefined || backHref === null) && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleBack}
                            className="-ml-2 h-9 w-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs sm:text-sm text-gray-500 truncate font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
