// components/shared/SearchBar.tsx
export const SearchBar = () => {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Search projects..."
          className="w-64 h-10 pl-10 pr-4 rounded-lg bg-gray-100 focus:bg-white border-2 border-transparent focus:border-purple-600 outline-none transition-colors"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    );
  };