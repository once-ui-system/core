"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { routes } from '@/resources';
import { Flex, Spinner } from '@once-ui-system/core';
import NotFound from '@/app/not-found';

interface RouteGuardProps {
    children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
    const pathname = usePathname();
    const [isRouteEnabled, setIsRouteEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performChecks = async () => {
            setLoading(true);
            setIsRouteEnabled(false);

            const checkRouteEnabled = () => {
                if (!pathname) return true;
                
                if (pathname === '/changelog' || pathname === '/roadmap') {
                    return routes[pathname as keyof typeof routes] === true;
                }
                
                return true;
            };

            const routeEnabled = checkRouteEnabled();
            setIsRouteEnabled(routeEnabled);
            setLoading(false);
        };

        performChecks();
    }, [pathname]);

    if (loading) {
        return (
        <Flex fillWidth paddingY="128" horizontal="center">
            <Spinner />
        </Flex>
        );
    }

    if (!isRouteEnabled) {
        return (
          <NotFound/>
        );
    }

    return <>{children}</>;
};

export { RouteGuard };