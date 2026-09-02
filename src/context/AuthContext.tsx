import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  getCurrentIdToken,
  logoutUser,
  reloadUser,
  subscribeToAuthState,
} from "../lib/auth";
import { getMe } from "../lib/api";
import type { UserRole } from "../types";

export interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  authenticated: boolean;
  emailVerified: boolean;
  role: UserRole | null;
  roleLoading: boolean;
  resolveRole: () => Promise<UserRole | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    let active = true;
    setRoleLoading(true);

    getCurrentIdToken()
      .then((token) => getMe(token))
      .then((me) => {
        if (active) {
          setRole(me.role);
        }
      })
      .catch(() => {
        if (active) {
          setRole(null);
        }
      })
      .finally(() => {
        if (active) {
          setRoleLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const resolveRole = useCallback(async (): Promise<UserRole | null> => {
    try {
      await reloadUser();
      const freshToken = await getCurrentIdToken();
      const me = await getMe(freshToken);
      setRole(me.role);
      return me.role;
    } catch {
      setRole(null);
      return null;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setRole(null);
    await logoutUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading,
      authenticated: currentUser !== null,
      emailVerified: currentUser?.emailVerified === true,
      role,
      roleLoading,
      resolveRole,
      signOut: handleSignOut,
    }),
    [currentUser, loading, role, roleLoading, resolveRole, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
