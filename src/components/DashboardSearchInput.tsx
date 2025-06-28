import { Component } from "solid-js";
import SearchInput from "~/components/SearchInput";
import { useSearch } from "~/context/SearchContext";

const DashboardSearchInput: Component = () => {
  const { searchQuery, onSearchChange } = useSearch();

  return (
    <SearchInput searchQuery={searchQuery} onSearchChange={onSearchChange} />
  );
};

export default DashboardSearchInput;