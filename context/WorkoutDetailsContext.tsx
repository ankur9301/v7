import React, { createContext, useContext, useState } from "react";

interface HistoryEntry {
  date: string;
  sets: number;
  reps: number;
  weight: number;
}

interface PR {
  weight: number;
  reps: number;
}

interface WorkoutDetailsContextProps {
  workoutHistory: Record<string, HistoryEntry[]>;
  personalRecords: Record<string, PR>;
  setWorkoutHistory: (workoutName: string, entry: HistoryEntry) => void;
  updatePersonalRecord: (workoutName: string, weight: number, reps: number) => void;
  clearHistory: (workoutName: string) => void;
}

const WorkoutDetailsContext = createContext<WorkoutDetailsContextProps | undefined>(undefined);

export const useWorkoutDetails = () => {
  const context = useContext(WorkoutDetailsContext);
  if (!context) {
    throw new Error("useWorkoutDetails must be used within a WorkoutDetailsProvider");
  }
  return context;
};

export const WorkoutDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutHistory, setWorkoutHistoryState] = useState<Record<string, HistoryEntry[]>>({});
  const [personalRecords, setPersonalRecords] = useState<Record<string, PR>>({});

  const setWorkoutHistory = (workoutName: string, entry: HistoryEntry) => {
    setWorkoutHistoryState((prev) => {
      const history = prev[workoutName] || [];
      return {
        ...prev,
        [workoutName]: [...history, entry],
      };
    });
  };

  const updatePersonalRecord = (workoutName: string, weight: number, reps: number) => {
    setPersonalRecords((prev) => {
      const currentPR = prev[workoutName];
      if (!currentPR || weight > currentPR.weight || reps > currentPR.reps) {
        return {
          ...prev,
          [workoutName]: { weight, reps },
        };
      }
      return prev;
    });
  };

  const clearHistory = (workoutName: string) => {
    setWorkoutHistoryState((prev) => {
      const updated = { ...prev };
      delete updated[workoutName];
      return updated;
    });
  };

  return (
    <WorkoutDetailsContext.Provider
      value={{
        workoutHistory,
        personalRecords,
        setWorkoutHistory,
        updatePersonalRecord,
        clearHistory,
      }}
    >
      {children}
    </WorkoutDetailsContext.Provider>
  );
};
