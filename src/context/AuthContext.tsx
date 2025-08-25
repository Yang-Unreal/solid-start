import { useLocation, useNavigate } from "@solidjs/router";
import { createContext, createEffect, createMemo, useContext } from "solid-js";
import { authClient } from "~/lib/auth-client";

// Define the shape of the context
export type AuthContextType = {
  session: ReturnType<typeof authClient.useSession>;
  handleLogoutSuccess: () => void;
};

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: any }) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = authClient.useSession();

  const handleLogoutSuccess = () => navigate("/login", { replace: true });

  const isDashboardRoute = createMemo(() =>
    location.pathname.startsWith("/dashboard")
  );

  createEffect(() => {
    const currentSession = session();
    if (currentSession.isPending) return;

    if (!currentSession.data?.user && isDashboardRoute()) {
      navigate("/login", { replace: true });
    }
  });

  const authState: AuthContextType = {
    session,
    handleLogoutSuccess,
  };

  return (
    <AuthContext.Provider value={authState}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
