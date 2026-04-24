import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { tokenStore } from "@/lib/api";

/**
 * Pathless layout that gates child routes behind auth.
 * Uses a quick token-presence check before render to avoid flashing protected
 * content; the AuthProvider revalidates the session on mount.
 */
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (!tokenStore.get()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
