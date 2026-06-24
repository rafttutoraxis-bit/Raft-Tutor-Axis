import React, { useState } from "react";

interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = "Search...",
  pageSize = 10,
  emptyMessage = "No records found.",
}: TableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Search Filter Heuristics
  const filteredData = data.filter(row => {
    if (!searchQuery || searchKeys.length === 0) return true;
    return searchKeys.some(key => {
      const val = row[key];
      return String(val || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      {/* Table Search Header */}
      {searchKeys.length > 0 && (
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="w-full bg-[#110d22] text-xs text-white border border-[#9bfc07]/15 rounded-xl px-4 py-3 outline-none focus:border-[#9bfc07] transition-all"
          />
        </div>
      )}

      {/* RTA Styled Virtual Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-[#9bfc07]/15 bg-[#1b1631]/60 shadow-lg">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#110d22] border-b border-[#9bfc07]/10 uppercase tracking-wider text-[9px] font-bold text-gray-400 select-none">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#9bfc07]/5 text-xs text-gray-300">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[#9bfc07]/5 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-4 ${col.className || ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-400 select-none px-2">
          <span>
            Showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}-
            {Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length} records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-lg bg-[#1b1631] border border-[#9bfc07]/15 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#9bfc07]/10 hover:text-white transition-all cursor-pointer font-bold"
            >
              Previous
            </button>
            <span className="font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-lg bg-[#1b1631] border border-[#9bfc07]/15 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#9bfc07]/10 hover:text-white transition-all cursor-pointer font-bold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Table;
