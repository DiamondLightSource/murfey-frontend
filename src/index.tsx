import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Root } from "routes/Root";
import { Home } from "routes/Home";
import { Session } from "routes/Session";
import { NewSession } from "routes/NewSession";
import { SessionLinker } from "routes/SessionLinker";
import { GainRefTransfer } from "routes/GainRefTransfer";
import { SessionSetup } from "routes/SessionSetup";
import { MagTable } from "routes/MagTable";
import { ProcessingParameters } from "routes/ProcessingParameters";
import { Error } from "routes/Error";
import { clientsLoader, sessionsLoader, sessionLoader } from "loaders/session_clients";
import { rsyncerLoader } from "loaders/rsyncers";
import { visitLoader } from "loaders/visits";
import { gainRefLoader } from "loaders/possibleGainRefs";
import { magTableLoader } from "loaders/magTable";
import { processingParametersLoader } from "loaders/processingParameters";
import { theme } from "styles/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MultigridSetup } from "routes/MultigridSetup";
import { machineConfigLoader } from "loaders/machineConfig";

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
          path: "/sessions/:sessid",
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
          path: "/new_session/setup/:sessid",
          element: <MultigridSetup />,
          errorElement: <Error />,
          loader: machineConfigLoader(queryClient),
        },
        {
          path: "/link_session",
          element: <SessionLinker />,
          errorElement: <Error />,
          loader: clientsLoader(queryClient),
        },
        {
          path: "/gain_ref_transfer",
          element: <GainRefTransfer />,
          errorElement: <Error />,
          loader: gainRefLoader(queryClient),
        },
        {
          path: "/new_session/parameters/:sessid",
          element: <SessionSetup />,
          errorElement: <Error />,
        },
        {
          path: "/sessions/:sessid/processing_parameters",
          element: <ProcessingParameters />,
          errorElement: <Error />,
          loader: ({ params }) => processingParametersLoader(queryClient)(params),
        },
        {
          path: "/mag_table",
          element: <MagTable />,
          errorElement: <Error />,
          loader: magTableLoader(queryClient),
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
