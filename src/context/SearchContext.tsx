// src/context/SearchContext.tsx

import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  on,
  type Accessor,
} from "solid-js";
import { useSearchParams } from "@solidjs/router";

interface SearchContextType {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>();

const LS_SEARCH_QUERY_KEY = "productSearchQuery";

export function SearchProvider(props: { children: any }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const getSearchParamString = (
    paramValue: string | string[] | undefined,
    defaultValue: string
  ): string => {
    return Array.isArray(paramValue)
      ? paramValue[0] || defaultValue
      : paramValue || defaultValue;
  };

  const [searchQuery, setSearchQuery] = createSignal(
    getSearchParamString(searchParams.q, "")
  );

  createEffect(
    on(searchQuery, (query) => {
      console.log(
        `[${Date.now()}] 2. SearchContext Effect: Calling setSearchParams with q=${query}`
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_SEARCH_QUERY_KEY, query);
      }
      setSearchParams(
        {
          ...searchParams,
          q: query || undefined,
        },
        { replace: true }
      );
    })
  );

  const onSearchChange = (query: string) => {
    console.log(
      `[${Date.now()}] 1. onSearchChange: User typed. New query: '${query}'`
    );
    setSearchQuery(query);
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
