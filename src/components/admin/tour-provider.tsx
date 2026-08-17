"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { InteractiveTourModal } from "./interactive-tour-modal";

interface TourContextType {
  isTourOpen: boolean;
  openTour: () => void;
  closeTour: () => void;
}

const TourContext = createContext<TourContextType>({
  isTourOpen: false,
  openTour: () => {},
  closeTour: () => {},
});

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    // Check if new user session has not seen tour yet
    const hasSeenTour = localStorage.getItem("kataloghub_tour_seen");
    if (!hasSeenTour) {
      // Auto open for first time login
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openTour = () => setIsTourOpen(true);
  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("kataloghub_tour_seen", "true");
  };

  return (
    <TourContext.Provider value={{ isTourOpen, openTour, closeTour }}>
      {children}
      {isTourOpen && <InteractiveTourModal isOpen={isTourOpen} onClose={closeTour} />}
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
