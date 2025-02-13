import { useEffect, useState } from "react";
import { getOfflineTasks } from "@/lib/db";

export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const syncTasks = async () => {
      const tasks = await getOfflineTasks();
      if (tasks.length > 0) {
        await fetch("/api/sync", {
          method: "POST",
          body: JSON.stringify(tasks),
        });
      }
    };

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncTasks();
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return isOnline;
}
