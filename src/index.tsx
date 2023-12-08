import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Root } from "routes/Root";
import { Home } from "routes/Home";
import { Session } from "routes/Session";
import { NewSession } from "routes/NewSession";
import { SessionLinker } from "routes/SessionLinker";
import { Error } from "routes/Error";
import { clientsLoader, sessionsLoader, sessionLoader } from "loaders/session_clients";
import { rsyncerLoader } from "loaders/rsyncers";
import { visitLoader } from "loaders/visits";
import { theme } from "styles/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const { ToastContainer } = createStandaloneToast();
const container = document.getElementById("root")!;
const root = createRoot(container);
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1.08e7 } } });

const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <Error />,
      children: [
        {
          path: "/",
          element: <Home />,
          errorElement: <Error />,
          loader: sessionsLoader(queryClient),
        },
        {
          path: "/sessions/:sessionId",
          element: <Session />,
          errorElement: <Error />,
          loader: ({ params }) => rsyncerLoader(queryClient)(params),
        },
        {
          path: "/new_session",
          element: <NewSession />,
          errorElement: <Error />,
          loader: visitLoader(queryClient),
        },
        {
          path: "/link_session",
          element: <SessionLinker />,
          errorElement: <Error />,
          loader: clientsLoader(queryClient),
        }
      ],
    }
]);

root.render(
    <ChakraProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
    </ChakraProvider>
  );
