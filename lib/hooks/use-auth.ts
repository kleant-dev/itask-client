import { useAuthStore, User } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    setAuth,
    logout: logoutStore,
  } = useAuthStore();

  const login = (accessToken: string, refreshToken: string, user?: User) => {
    setAuth(accessToken, refreshToken, user);
    router.push("/home");
  };

  const logout = () => {
    logoutStore();
    router.push("/login");
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
  };
}
