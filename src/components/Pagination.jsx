function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;