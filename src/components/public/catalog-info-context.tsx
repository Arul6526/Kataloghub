"use client";

import { createContext, useContext, useState } from "react";

interface CatalogInfoContextType {
  isBannerOpen: boolean;
  setIsBannerOpen: (open: boolean) => void;
  toggleBanner: () => void;
}

const CatalogInfoContext = createContext<CatalogInfoContextType>({
  isBannerOpen: true,
  setIsBannerOpen: () => {},
  toggleBanner: () => {},
});

export function CatalogInfoProvider({ children }: { children: React.ReactNode }) {
  const [isBannerOpen, setIsBannerOpen] = useState(true);

  const toggleBanner = () => setIsBannerOpen((prev) => !prev);

  return (
    <CatalogInfoContext.Provider value={{ isBannerOpen, setIsBannerOpen, toggleBanner }}>
      {children}
    </CatalogInfoContext.Provider>
  );
}

export function useCatalogInfo() {
  return useContext(CatalogInfoContext);
}
