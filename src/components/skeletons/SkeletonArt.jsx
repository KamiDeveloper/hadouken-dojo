import React from 'react';

const SkeletonArt = () => {
    return (
        <section className="skeleton-art py-20 px-6 bg-black">
            <div className="container mx-auto">
                {/* Section Title Skeleton */}
                <div className="text-center mb-12">
                    <div className="skeleton-box h-10 w-64 mx-auto rounded-lg mb-4"></div>
                    <div className="skeleton-box h-6 w-96 mx-auto rounded"></div>
                </div>

                {/* Art Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Art Card 1 */}
                    <div className="skeleton-art-card">
                        <div className="skeleton-box aspect-square rounded-xl mb-4"></div>
                        <div className="skeleton-box h-6 w-3/4 rounded mb-2"></div>
                        <div className="skeleton-box h-4 w-full rounded"></div>
                    </div>

                    {/* Art Card 2 */}
                    <div className="skeleton-art-card">
                        <div className="skeleton-box aspect-square rounded-xl mb-4"></div>
                        <div className="skeleton-box h-6 w-3/4 rounded mb-2"></div>
                        <div className="skeleton-box h-4 w-full rounded"></div>
                    </div>

                    {/* Art Card 3 */}
                    <div className="skeleton-art-card">
                        <div className="skeleton-box aspect-square rounded-xl mb-4"></div>
                        <div className="skeleton-box h-6 w-3/4 rounded mb-2"></div>
                        <div className="skeleton-box h-4 w-full rounded"></div>
                    </div>
                </div>

                {/* CTA Button Skeleton */}
                <div className="flex justify-center mt-12">
                    <div className="skeleton-box h-12 w-48 rounded-full"></div>
                </div>
            </div>
        </section>
    );
};

export default SkeletonArt;
