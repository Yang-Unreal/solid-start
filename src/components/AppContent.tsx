import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { QueryClientProvider } from "@tanstack/solid-query";
import { Suspense } from "solid-js";
import { queryClient } from "~/lib/query-client";
import Nav from "./Nav";

export function AppContent(props: {
  children: any;
  session: any;
  handleLogoutSuccess: () => void;
  isDashboardRoute: () => boolean;
  isTransparentNavPage: () => boolean;
  isScrolled: () => boolean;
  isHomepage: () => boolean;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MetaProvider>
        <Title>Liming</Title>
        <Meta
          name="description"
          content="Let the hidden pears shine for the world"
        />
        <Nav
          onLogoutSuccess={props.handleLogoutSuccess}
          session={props.session}
          transparent={props.isTransparentNavPage() && !props.isScrolled()}
          removeNavContainerClass={
            props.isTransparentNavPage() && !props.isScrolled()
          }
          isHomepage={props.isHomepage()}
        />
        <main class="flex-grow">
          <Suspense fallback={null}>{props.children}</Suspense>
        </main>
      </MetaProvider>
    </QueryClientProvider>
  );
}
