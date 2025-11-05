import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas de administrador
 * Redirige a / si el usuario no es admin
 */
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a getstarted
    if (!user) {
        return <Navigate to="/getstarted" replace />;
    }

    // Si no es admin, redirigir a home
    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Usuario es admin - renderizar la ruta
    return children;
};

export default AdminRoute;
