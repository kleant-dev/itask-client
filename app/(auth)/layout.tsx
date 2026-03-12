import { RouteGuard } from "@/components/auth/route-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard type="guest">{children}</RouteGuard>;
}
