import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login guardando la ubicación actual
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si el usuario necesita completar su perfil, redirigir a completar-registro
    if (user.needsProfileCompletion) {
        return <Navigate to="/completar-registro" replace />;
    }

    // Usuario autenticado y con perfil completo - renderizar la ruta
    return children;
};

export default PrivateRoute;
