// src/context/SearchContext.tsx

import {
  createContext,
  useContext,
  createSignal,
  onMount,
  type Accessor,
} from "solid-js";

interface SearchContextType {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>();

const LS_SEARCH_QUERY_KEY = "productSearchQuery";

export function SearchProvider(props: { children: any }) {
  const [searchQuery, setSearchQuery] = createSignal("");

  onMount(() => {
    const storedQuery = localStorage.getItem(LS_SEARCH_QUERY_KEY);
    if (storedQuery) {
      setSearchQuery(storedQuery);
    }
  });

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_SEARCH_QUERY_KEY, query);
    }
  };

  const value = {
    searchQuery,
    onSearchChange,
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
