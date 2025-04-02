import React, { createContext, useContext, useState, useEffect } from "react";
import { applySnapshot, onSnapshot } from "mobx-state-tree";
import {
  IRootStore,
  RootStore,
  RootStoreSnapshot,
} from "./models/models/RootStore.model";

const StoreContext = createContext<IRootStore | null>(null);

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [store, setStore] = useState<IRootStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStore = async () => {
      const storedData = localStorage.getItem("RootStore");
      let initialState: RootStoreSnapshot = {
        users: [],
        tasks: [],
        projects: [],
        isAuthenticated: false,
      };

      if (storedData) {
        try {
          initialState = JSON.parse(storedData);
        } catch (e) {
          console.error("Failed to parse stored data", e);
          localStorage.removeItem("RootStore"); // Clear corrupted data
        }
      }

      const storeInstance = RootStore.create(initialState);

      applySnapshot(storeInstance, initialState); // Apply snapshot after creation
      setStore(storeInstance);
      setLoading(false);
    };

    initializeStore();
  }, []);

  useEffect(() => {
    if (store) {
      // Set up a listener to save changes to localStorage
      const disposer = onSnapshot(store, (snapshot) => {
        console.log("Store changed, saving to localStorage:", snapshot);
        localStorage.setItem("RootStore", JSON.stringify(snapshot));
      });

      // Clean up the listener when the component unmounts
      return () => {
        disposer();
      };
    }
  }, [store]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!store) {
    throw new Error("Store cannot be null, please add a StoreProvider");
  }

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("Store cannot be null, please add a StoreProvider");
  }
  return store;
};
