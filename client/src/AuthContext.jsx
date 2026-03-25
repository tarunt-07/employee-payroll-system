import { createContext, useContext, useEffect, useState } from "react";
import {
  clearSession,
  getCurrentUser,
  getStoredUser,
  hasSession,
  loginUser,
  registerUser,
  startPreviewSession,
  storeSession,
} from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      if (!hasSession()) {
        if (active) {
          setAuthReady(true);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (active) {
          setUser(currentUser);
        }
      } catch (_error) {
        clearSession();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    };

    restore();

    return () => {
      active = false;
    };
  }, []);

  const login = async (payload) => {
    const session = await loginUser(payload);
    storeSession(session);
    setUser(session.user);
    return session.user;
  };

  const register = async (payload) => {
    const session = await registerUser(payload);
    storeSession(session);
    setUser(session.user);
    return session.user;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const enterPreviewMode = () => {
    const session = startPreviewSession();
    storeSession(session);
    setUser(session.user);
    return session.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        enterPreviewMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
