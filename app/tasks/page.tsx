'use client';
import { useEffect, useState } from 'react';
import { getOfflineTasks, saveTaskOffline } from '@/lib/indexedDB';

// Define the task type
interface Task {
  id: string;
  title: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]); // Set type for the state

  useEffect(() => {
    async function syncOfflineData() {
      if (navigator.onLine) {
        const offlineTasks = await getOfflineTasks();
        if (offlineTasks.length > 0) {
          await fetch('/api/sync-tasks', {
            method: 'POST',
            body: JSON.stringify(offlineTasks),
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        console.log('Offline mode: Using cached tasks');
        const cachedTasks = await getOfflineTasks();
        setTasks(cachedTasks); // Now this works without the type error
      }
    }

    syncOfflineData();
  }, []);

  return (
    <div>
      <h1>Tasks</h1>
      {tasks.map((task) => (
        <p key={task.id}>{task.title}</p>
      ))}
    </div>
  );
}
