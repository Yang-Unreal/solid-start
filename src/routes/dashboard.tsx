// src/routes/dashboard.tsx
import { createEffect } from "solid-js";
import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";

export default function DashboardLayout(props: RouteSectionProps) {
  const sessionSignal = authClient.useSession();
  const navigate = useNavigate();

  // This effect protects all routes under /dashboard/*
  createEffect(() => {
    const currentSession = sessionSignal();
    if (!currentSession.isPending && !currentSession.data?.user) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <div class="pt-18 md:pt-26  container-padding">
      {/* The router renders the correct page (index.tsx or vehicles.tsx) here */}
      {props.children}
    </div>
  );
}
