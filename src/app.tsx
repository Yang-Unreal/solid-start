import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "lenis/dist/lenis.css";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { AppContent } from "~/components/AppContent";
import { AuthProvider } from "~/context/AuthContext";
import { LenisProvider } from "~/context/LenisContext";
import { MenuProvider } from "~/context/MenuContext";
import { PageTransitionProvider } from "~/context/PageTransitionContext";
import { SearchProvider } from "~/context/SearchContext";
import { queryClient } from "~/lib/query-client";

export default function App() {
	return (
		<LenisProvider>
			<Router
				root={(props) => {
					return (
						<AuthProvider>
							<SearchProvider>
								<PageTransitionProvider>
									<MenuProvider>
										<QueryClientProvider client={queryClient}>
											<AppContent children={props.children} />
										</QueryClientProvider>
									</MenuProvider>
								</PageTransitionProvider>
							</SearchProvider>
						</AuthProvider>
					);
				}}
			>
				<FileRoutes />
			</Router>
		</LenisProvider>
	);
}
