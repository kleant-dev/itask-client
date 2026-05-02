import { useAuthStore, User } from "@/lib/stores/auth-store";
import { usersApi } from "@/lib/api/users";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    setAuth,
    setUser,
    logout: logoutStore,
  } = useAuthStore();

  const login = async (
    accessToken: string,
    refreshToken: string,
    user?: User,
  ) => {
    // Store tokens immediately so the API client can use them for the /me call
    setAuth(accessToken, refreshToken, user);

    // The server's login endpoint doesn't return the user object, so fetch it now
    if (!user) {
      try {
        const me = await usersApi.getMe();
        setUser(me);
      } catch {
        // Non-fatal — user will just be null until next page load
      }
    }

    router.push("/home");
  };

  const logout = () => {
    logoutStore();
    router.push("/login");
  };

  return {
    user,
    isAuthenticated: isAuthenticated,
    login,
    logout,
  };
}
