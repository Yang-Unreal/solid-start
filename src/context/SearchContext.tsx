// src/context/SearchContext.tsx

import {
  createContext,
  useContext,
  createSignal,
  onMount,
  type Accessor,
  type Setter,
} from "solid-js";

interface SearchContextType {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
  selectedBrands: Accessor<string[]>;
  setSelectedBrands: (brands: string[]) => void;
  selectedFuelTypes: Accessor<string[]>;
  setSelectedFuelTypes: (fuelTypes: string[]) => void;
  selectedPowertrainTypes: Accessor<string[]>;
  setSelectedPowertrainTypes: (powertrainTypes: string[]) => void;
  currentPage: Accessor<number>;
  setCurrentPage: Setter<number>;
}

const SearchContext = createContext<SearchContextType>();

const LS_SEARCH_QUERY_KEY = "productSearchQuery";
const LS_SELECTED_BRANDS_KEY = "selectedBrands";
const LS_SELECTED_FUEL_TYPES_KEY = "selectedFuelTypes";
const LS_SELECTED_POWERTRAIN_TYPES_KEY = "selectedPowertrainTypes";

export function SearchProvider(props: { children: any }) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedBrands, setSelectedBrands] = createSignal<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = createSignal<string[]>([]);
  const [selectedPowertrainTypes, setSelectedPowertrainTypes] = createSignal<
    string[]
  >([]);
  const [currentPage, setCurrentPage] = createSignal(1);

  onMount(() => {
    const storedQuery = localStorage.getItem(LS_SEARCH_QUERY_KEY);
    if (storedQuery) {
      setSearchQuery(storedQuery);
    }

    const storedBrands = localStorage.getItem(LS_SELECTED_BRANDS_KEY);
    if (storedBrands) {
      setSelectedBrands(JSON.parse(storedBrands));
    }

    const storedFuelTypes = localStorage.getItem(LS_SELECTED_FUEL_TYPES_KEY);
    if (storedFuelTypes) {
      setSelectedFuelTypes(JSON.parse(storedFuelTypes));
    }

    const storedPowertrainTypes = localStorage.getItem(
      LS_SELECTED_POWERTRAIN_TYPES_KEY
    );
    if (storedPowertrainTypes) {
      setSelectedPowertrainTypes(JSON.parse(storedPowertrainTypes));
    }
  });

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_SEARCH_QUERY_KEY, query);
    }
  };

  const updateSelectedBrands = (brands: string[]) => {
    setSelectedBrands(brands);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_SELECTED_BRANDS_KEY, JSON.stringify(brands));
    }
  };

  const updateSelectedFuelTypes = (fuelTypes: string[]) => {
    setSelectedFuelTypes(fuelTypes);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LS_SELECTED_FUEL_TYPES_KEY,
        JSON.stringify(fuelTypes)
      );
    }
  };

  const updateSelectedPowertrainTypes = (powertrainTypes: string[]) => {
    setSelectedPowertrainTypes(powertrainTypes);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LS_SELECTED_POWERTRAIN_TYPES_KEY,
        JSON.stringify(powertrainTypes)
      );
    }
  };

  const value = {
    searchQuery,
    onSearchChange,
    selectedBrands,
    setSelectedBrands: updateSelectedBrands,
    selectedFuelTypes,
    setSelectedFuelTypes: updateSelectedFuelTypes,
    selectedPowertrainTypes,
    setSelectedPowertrainTypes: updateSelectedPowertrainTypes,
    currentPage,
    setCurrentPage,
  };

  return (
    <SearchContext.Provider value={value}>
      {props.children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
