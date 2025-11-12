import SkeletonNavBar from '../skeletons/SkeletonNavBar';
import SkeletonHero from '../skeletons/SkeletonHero';
import SkeletonArt from '../skeletons/SkeletonArt';

/**
 * Componente que muestra la página completa con skeletons
 * Se usa mientras los assets se están cargando
 */
const SkeletonPage = () => {
    return (
        <div className="skeleton-page min-h-screen bg-black">
            <SkeletonNavBar />
            <SkeletonHero />
            <SkeletonArt />

            {/* Opcional: Más secciones skeleton si las tienes */}
            <div className="py-20 px-6 bg-black">
                <div className="container mx-auto space-y-8">
                    <div className="skeleton-box h-8 w-48 mx-auto rounded-lg"></div>
                    <div className="skeleton-box h-4 w-96 mx-auto rounded"></div>
                    <div className="skeleton-box h-4 w-80 mx-auto rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonPage;
