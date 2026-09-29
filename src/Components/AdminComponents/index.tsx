// Chrome for the admin shell only. Charts are imported from their own paths so
// that a page pulling in `Header` does not also drag recharts into its chunk.
export { default as Header } from "./Header";
export { default as Navbar } from "./Navbar";
export { default as Searchbar } from "./Searchbar";
export { default as Sidebar } from "./Sidebar";
