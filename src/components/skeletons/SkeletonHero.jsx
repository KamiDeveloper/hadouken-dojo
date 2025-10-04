import React from 'react';

const SkeletonHero = () => {
    return (
        <section className="skeleton-hero relative h-screen w-full overflow-hidden bg-black">
            {/* Video Background Skeleton */}
            <div className="absolute inset-0 skeleton-box"></div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
                {/* Logo Skeleton - Centered */}
                <div className="skeleton-box w-64 h-64 md:w-96 md:h-96 rounded-2xl mb-8"></div>

                {/* Title Skeleton */}
                <div className="skeleton-box h-12 w-80 md:w-96 rounded-lg mb-4"></div>

                {/* Subtitle Skeleton */}
                <div className="skeleton-box h-6 w-64 md:w-80 rounded mb-8"></div>

                {/* CTA Buttons Skeleton */}
                <div className="flex gap-4">
                    <div className="skeleton-box h-12 w-32 rounded-full"></div>
                    <div className="skeleton-box h-12 w-32 rounded-full"></div>
                </div>
            </div>

            {/* Scroll Indicator Skeleton */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="skeleton-box h-12 w-6 rounded-full"></div>
            </div>
        </section>
    );
};

export default SkeletonHero;
