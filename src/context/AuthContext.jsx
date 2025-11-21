import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import toast from 'react-hot-toast';

// Crear el contexto
const AuthContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de autenticación
 * Uso: const { user, loading, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

/**
 * Provider de Autenticación
 * Maneja todo el estado de autenticación de Firebase
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Listener de cambios de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Usuario autenticado - obtener datos adicionales de Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (userDoc.exists()) {
                        // Usuario tiene perfil completo en Firestore
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            emailVerified: firebaseUser.emailVerified,
                            photoURL: firebaseUser.photoURL,
                            ...userDoc.data(),
                        });
                    } else {
                        // Usuario autenticado pero sin perfil en Firestore (caso de Lazy Registration)
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            emailVerified: firebaseUser.emailVerified,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            needsProfileCompletion: true, // Flag para redirigir a /completar-registro
                        });
                    }

                    // Actualizar lastLogin
                    if (userDoc.exists()) {
                        await setDoc(
                            doc(db, 'users', firebaseUser.uid),
                            { lastLogin: serverTimestamp() },
                            { merge: true }
                        );
                    }
                } catch (err) {
                    console.error('Error obteniendo datos del usuario:', err);
                    setError(err.message);
                }
            } else {
                // No hay usuario autenticado
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup
        return () => unsubscribe();
    }, []);

    /**
     * Login con Google
     */
    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);

            // Verificar si el usuario ya tiene perfil en Firestore
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));

            if (!userDoc.exists()) {
                // Nuevo usuario - necesita completar registro
                toast.success('¡Bienvenido! Completa tu registro');
                return { needsProfileCompletion: true };
            }

            toast.success('¡Bienvenido de nuevo!');
            return { needsProfileCompletion: false };
        } catch (err) {
            console.error('Error en login con Google:', err);
            setError(err.message);
            toast.error('Error al iniciar sesión con Google');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login con Email y Contraseña
     */
    const loginWithEmail = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('¡Inicio de sesión exitoso!');
        } catch (err) {
            console.error('Error en login con email:', err);
            setError(err.message);

            // Mensajes de error amigables
            if (err.code === 'auth/user-not-found') {
                toast.error('Usuario no encontrado');
            } else if (err.code === 'auth/wrong-password') {
                toast.error('Contraseña incorrecta');
            } else if (err.code === 'auth/invalid-email') {
                toast.error('Email inválido');
            } else {
                toast.error('Error al iniciar sesión');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registro con Email y Contraseña
     */
    const signupWithEmail = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            // Crear usuario en Firebase Auth
            const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

            // Enviar email de verificación
            await sendEmailVerification(result.user);

            // Crear perfil en Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                displayName: userData.displayName,
                username: userData.username,
                email: userData.email,
                photoURL: userData.photoURL || null,
                phone: userData.phone || null,
                role: 'user',
                strikes: 0,
                bannedUntil: null,
                hasLocalPassword: true,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                metadata: {
                    authProvider: 'email',
                    emailVerified: false,
                },
            });

            toast.success('¡Registro exitoso! Verifica tu email');
        } catch (err) {
            console.error('Error en registro:', err);
            setError(err.message);

            // Mensajes de error amigables
            if (err.code === 'auth/email-already-in-use') {
                toast.error('Este email ya está registrado');
            } else if (err.code === 'auth/weak-password') {
                toast.error('La contraseña debe tener al menos 6 caracteres');
            } else if (err.code === 'auth/invalid-email') {
                toast.error('Email inválido');
            } else {
                toast.error('Error al registrarse');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Completar perfil después de OAuth (Lazy Registration)
     * @param {Object} data - Datos del perfil { username, phone }
     */
    const completeProfile = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('No hay usuario autenticado');
            }

            const { username, phone } = data;

            // Verificar que el username no esté en uso
            const usernameQuery = query(
                collection(db, 'users'),
                where('username', '==', username.toLowerCase()),
                limit(1) // ✅ Agregar limit para cumplir con Firestore Rules
            );
            const usernameSnapshot = await getDocs(usernameQuery);

            if (!usernameSnapshot.empty) {
                throw new Error('username already exists');
            }

            // Crear perfil en Firestore
            await setDoc(doc(db, 'users', currentUser.uid), {
                displayName: currentUser.displayName,
                username: username.toLowerCase(),
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                phone: phone || null,
                role: 'user',
                strikes: 0,
                bannedUntil: null,
                hasLocalPassword: false,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                metadata: {
                    authProvider: 'google',
                    emailVerified: currentUser.emailVerified,
                },
            });

            // Actualizar el estado del usuario en el contexto
            setUser({
                uid: currentUser.uid,
                email: currentUser.email,
                emailVerified: currentUser.emailVerified,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                username: username.toLowerCase(),
                phone: phone,
                role: 'user',
                strikes: 0,
                bannedUntil: null,
                needsProfileCompletion: false,
            });

            // Limpiar caché de validación
            sessionStorage.removeItem(`profile_validated_${currentUser.uid}`);
            sessionStorage.setItem(`profile_validated_${currentUser.uid}`, 'true');
        } catch (err) {
            console.error('Error completando perfil:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cerrar sesión
     */
    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            setUser(null);
            toast.success('Sesión cerrada');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            setError(err.message);
            toast.error('Error al cerrar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        completeProfile,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
