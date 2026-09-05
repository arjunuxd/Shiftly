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
  refreshing: boolean;
  role: UserRole | null;
  roleLoading: boolean;
  accountStatus: "active" | "suspended" | null;
  resolveRole: () => Promise<UserRole | null>;
  refreshUser: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState<"active" | "suspended" | null>(
    null,
  );

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
      setAccountStatus(null);
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
          setAccountStatus(me.accountStatus ?? "active");
        }
      })
      .catch(() => {
        if (active) {
          setRole(null);
          setAccountStatus(null);
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
      setAccountStatus(me.accountStatus ?? "active");
      return me.role;
    } catch {
      setRole(null);
      setAccountStatus(null);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!currentUser) return null;
    setRefreshing(true);
    try {
      await reloadUser();
      setCurrentUser({ ...currentUser });
      return currentUser;
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);

  const handleSignOut = useCallback(async () => {
    setRole(null);
    setAccountStatus(null);
    await logoutUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading,
      authenticated: currentUser !== null,
      emailVerified: currentUser?.emailVerified === true,
      refreshing,
      role,
      roleLoading,
      accountStatus,
      resolveRole,
      refreshUser,
      signOut: handleSignOut,
    }),
    [currentUser, loading, refreshing, role, roleLoading, accountStatus, resolveRole, refreshUser, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
