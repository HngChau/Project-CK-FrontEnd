import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <>
      <style>{`
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin: 32px 0;
        }

        .pagination button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: #fff;
          color: #333;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination button:hover:not(:disabled) {
          border-color: #c00;
          color: #c00;
        }

        .pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #555;
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .pagination {
            gap: 10px;
          }

          .pagination button {
            padding: 8px 10px;
            font-size: 13px;
          }
        }
      `}</style>

      <nav className="pagination" aria-label="Phân trang">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
          <span>Trước</span>
        </button>

        <span className="pagination-info">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Trang sau"
        >
          <span>Tiếp</span>
          <ChevronRight size={18} />
        </button>
      </nav>
    </>
  );
}
