import { QueryClient } from "@tanstack/react-query";
import { client } from "utils/api/client";
import { components } from "schema/main";

type MultigridWatcherSpec = components["schemas"]["MultigridWatcherSetup"];

export const startMultigridWatcher = async (
  multigridWatcher: MultigridWatcherSpec,
  sessionId: number,
) => {
  console.log(sessionId);
  console.log(multigridWatcher);
  const response = await client.post(
    `sessions/${sessionId}/multigrid_watcher`,
    multigridWatcher,
  );

  console.log(response.data);
  if (response.status !== 200) {
    return null;
  }

  return response.data;
};
