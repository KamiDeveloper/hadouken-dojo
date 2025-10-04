import React from 'react';

const SkeletonNavBar = () => {
    return (
        <nav className="skeleton-navbar fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo Skeleton */}
                    <div className="skeleton-box h-12 w-32 rounded-lg"></div>

                    {/* Menu Items Skeleton - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="skeleton-box h-6 w-20 rounded"></div>
                        ))}
                    </div>

                    {/* CTA Button Skeleton */}
                    <div className="skeleton-box h-10 w-32 rounded-full"></div>

                    {/* Mobile Menu Icon Skeleton */}
                    <div className="md:hidden skeleton-box h-8 w-8 rounded"></div>
                </div>
            </div>
        </nav>
    );
};

export default SkeletonNavBar;
