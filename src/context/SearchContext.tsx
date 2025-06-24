// src/context/SearchContext.tsx

import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
} from "solid-js";
import { useSearchParams, useLocation } from "@solidjs/router";

interface SearchContextType {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>();

const LS_SEARCH_QUERY_KEY = "productSearchQuery";

export function SearchProvider(props: { children: any }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();

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

  const onSearchChange = (query: string) => {
    console.log(
      `[${Date.now()}] 1. onSearchChange: User typed. New query: '${query}'`
    );
    setSearchQuery(query);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_SEARCH_QUERY_KEY, query);
    }

    const newSearchParams = new URLSearchParams();
    for (const key in searchParams) {
      const value = searchParams[key];
      if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      } else if (value !== undefined) {
        newSearchParams.set(key, value);
      }
    }

    if (query) {
      newSearchParams.set("q", query);
    } else {
      newSearchParams.delete("q");
    }

    const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
    window.history.replaceState({}, "", newUrl);
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
