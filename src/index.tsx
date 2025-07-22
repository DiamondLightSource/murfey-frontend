import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ProtectedRoutes } from 'components/protectedRoutes'
import { dataCollectionGroupsLoader } from 'loaders/dataCollectionGroups'
import { gridSquaresLoader } from 'loaders/gridSquares'
import { instrumentInfoLoader } from 'loaders/hub'
import { machineConfigLoader } from 'loaders/machineConfig'
import { magTableLoader } from 'loaders/magTable'
import { gainRefLoader } from 'loaders/possibleGainRefs'
import {
  processingParametersLoader,
  sessionParametersLoader,
} from 'loaders/processingParameters'
import { rsyncerLoader } from 'loaders/rsyncers'
import { allSessionsLoader, sessionLoader } from 'loaders/sessionClients'
import { visitLoader } from 'loaders/visits'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { DataCollectionGroups } from 'routes/DataCollectionGroups'
import { Error } from 'routes/Error'
import { GainRefTransfer } from 'routes/GainRefTransfer'
import { GridSquares } from 'routes/GridSquares'
import { Home } from 'routes/Home'
import { Hub } from 'routes/Hub'
import { Login } from 'routes/Login'
import { MagTable } from 'routes/MagTable'
import { MultigridSetup } from 'routes/MultigridSetup'
import { NewSession } from 'routes/NewSession'
import { ProcessingParameters } from 'routes/ProcessingParameters'
import { Session } from 'routes/Session'
import { SessionParameters } from 'routes/SessionParameters'
import { SessionSetup } from 'routes/SessionSetup'
import { theme } from 'styles/theme'

const { ToastContainer } = createStandaloneToast()
const container = document.getElementById('root')!
const root = createRoot(container)
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1.08e7 } },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/hub" replace />,
  },
  {
    path: '/hub',
    element: <Hub />,
    errorElement: <Error />,
    loader: instrumentInfoLoader(queryClient),
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: '/',
    element: <ProtectedRoutes />,
    errorElement: <Error />,
    children: [
      {
        path: '/home',
        element: <Home />,
        errorElement: <Error />,
        loader: allSessionsLoader(queryClient),
      },
      {
        path: '/instruments/:instrumentName/new_session',
        element: <NewSession />,
        errorElement: <Error />,
        loader: ({ params }) => visitLoader(queryClient)(params),
      },
      {
        path: '/new_session/setup/:sessid',
        element: <MultigridSetup />,
        errorElement: <Error />,
        loader: machineConfigLoader(queryClient),
      },
      {
        path: '/new_session/parameters/:sessid',
        element: <SessionSetup />,
        errorElement: <Error />,
        loader: ({ params }) => sessionLoader(queryClient)(params),
      },
      {
        path: '/sessions/:sessid',
        element: <Session />,
        errorElement: <Error />,
        loader: ({ params }) => rsyncerLoader(queryClient)(params),
      },
      {
        path: '/sessions/:sessid/gain_ref_transfer',
        element: <GainRefTransfer />,
        errorElement: <Error />,
        loader: ({ params }) => gainRefLoader(queryClient)(params),
      },
      {
        path: '/sessions/:sessid/session_parameters',
        element: <SessionParameters />,
        errorElement: <Error />,
        loader: ({ params }) => sessionParametersLoader(queryClient)(params),
      },
      {
        path: '/sessions/:sessid/session_parameters/extra_parameters',
        element: <ProcessingParameters />,
        errorElement: <Error />,
        loader: ({ params }) => processingParametersLoader(queryClient)(params),
      },
      {
        path: '/sessions/:sessid/data_collection_groups',
        element: <DataCollectionGroups />,
        errorElement: <Error />,
        loader: ({ params }) => dataCollectionGroupsLoader(queryClient)(params),
      },
      {
        path: '/sessions/:sessid/data_collection_groups/:dcgid/grid_squares',
        element: <GridSquares />,
        errorElement: <Error />,
        loader: ({ params }) => gridSquaresLoader(queryClient)(params),
      },
      {
        path: '/mag_table',
        element: <MagTable />,
        errorElement: <Error />,
        loader: magTableLoader(queryClient),
      },
    ],
  },
])

root.render(
  <ChakraProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </ChakraProvider>
)
