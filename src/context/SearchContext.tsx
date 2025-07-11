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
  selectedCategories: Accessor<string[]>;
  setSelectedCategories: (categories: string[]) => void;
  selectedFuelTypes: Accessor<string[]>;
  setSelectedFuelTypes: (fuelTypes: string[]) => void;
  showFilters: Accessor<boolean>;
  setShowFilters: Setter<boolean>;
}

const SearchContext = createContext<SearchContextType>();

const LS_SEARCH_QUERY_KEY = "productSearchQuery";
const LS_SELECTED_BRANDS_KEY = "selectedBrands";
const LS_SELECTED_CATEGORIES_KEY = "selectedCategories";
const LS_SELECTED_FUEL_TYPES_KEY = "selectedFuelTypes";

export function SearchProvider(props: { children: any }) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedBrands, setSelectedBrands] = createSignal<string[]>([]);
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    []
  );
  const [selectedFuelTypes, setSelectedFuelTypes] = createSignal<string[]>([]);
  const [showFilters, setShowFilters] = createSignal(false);

  onMount(() => {
    const storedQuery = localStorage.getItem(LS_SEARCH_QUERY_KEY);
    if (storedQuery) {
      setSearchQuery(storedQuery);
    }

    const storedBrands = localStorage.getItem(LS_SELECTED_BRANDS_KEY);
    if (storedBrands) {
      setSelectedBrands(JSON.parse(storedBrands));
    }

    const storedCategories = localStorage.getItem(LS_SELECTED_CATEGORIES_KEY);
    if (storedCategories) {
      setSelectedCategories(JSON.parse(storedCategories));
    }

    const storedFuelTypes = localStorage.getItem(LS_SELECTED_FUEL_TYPES_KEY);
    if (storedFuelTypes) {
      setSelectedFuelTypes(JSON.parse(storedFuelTypes));
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

  const updateSelectedCategories = (categories: string[]) => {
    setSelectedCategories(categories);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LS_SELECTED_CATEGORIES_KEY,
        JSON.stringify(categories)
      );
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

  const value = {
    searchQuery,
    onSearchChange,
    selectedBrands,
    setSelectedBrands: updateSelectedBrands,
    selectedCategories,
    setSelectedCategories: updateSelectedCategories,
    selectedFuelTypes,
    setSelectedFuelTypes: updateSelectedFuelTypes,
    showFilters,
    setShowFilters,
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
