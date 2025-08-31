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
  selectedFilters: Accessor<Record<string, string[]>>;
  updateFilter: (filterName: string, value: string) => void;
  clearFilters: () => void;
  currentPage: Accessor<number>;
  setCurrentPage: Setter<number>;
  sortOption: Accessor<string>;
  setSortOption: (sort: string) => void;
}

const SearchContext = createContext<SearchContextType>();

const LS_SEARCH_QUERY_KEY = "searchQuery";
const LS_SELECTED_FILTERS_KEY = "selectedFilters";
const LS_SORT_OPTION_KEY = "sortOption";

export function SearchProvider(props: { children: any }) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedFilters, setSelectedFilters] = createSignal<
    Record<string, string[]>
  >({});
  const [currentPage, setCurrentPage] = createSignal(1);
  const [sortOption, setSortOption] = createSignal("price:asc");

  onMount(() => {
    const storedQuery = localStorage.getItem(LS_SEARCH_QUERY_KEY);
    if (storedQuery) setSearchQuery(storedQuery);

    const storedFilters = localStorage.getItem(LS_SELECTED_FILTERS_KEY);
    if (storedFilters) setSelectedFilters(JSON.parse(storedFilters));

    const storedSortOption = localStorage.getItem(LS_SORT_OPTION_KEY);
    if (storedSortOption) setSortOption(storedSortOption);
  });

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    localStorage.setItem(LS_SEARCH_QUERY_KEY, query);
  };

  const updateFilter = (filterName: string, value: string) => {
    const currentFilters = selectedFilters();
    const currentValues = currentFilters[filterName] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const newFilters = { ...currentFilters, [filterName]: newValues };
    setSelectedFilters(newFilters);
    localStorage.setItem(LS_SELECTED_FILTERS_KEY, JSON.stringify(newFilters));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    localStorage.removeItem(LS_SELECTED_FILTERS_KEY);
  };

  const updateSortOption = (sort: string) => {
    setSortOption(sort);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_SORT_OPTION_KEY, sort);
    }
  };

  const value = {
    searchQuery,
    onSearchChange,
    selectedFilters,
    updateFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    sortOption,
    setSortOption: updateSortOption,
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
