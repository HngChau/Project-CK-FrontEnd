
interface Props {
  count?: number;
}

export default function ArticleSkeleton({ count = 12 }: Props) {
  return (
    <>
      <style>{`
        .skeleton-card {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #eee;
        }

        .skeleton-image {
          width: 160px;
          min-width: 160px;
          height: 110px;
          border-radius: 8px;
        }

        .skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-line {
          height: 14px;
          width: 100%;
          border-radius: 4px;
        }

        .skeleton-line.title {
          height: 20px;
          width: 85%;
        }

        .skeleton-line.short {
          width: 55%;
        }

        .skeleton-image,
        .skeleton-line {
          background: linear-gradient(
            90deg,
            #eeeeee 25%,
            #f8f8f8 50%,
            #eeeeee 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
        }

        @keyframes skeleton-shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
      `}</style>

      <div className="list" aria-label="Đang tải tin" aria-busy="true">
        {Array.from({ length: count }).map((_, index) => (
          <div className="skeleton-card" key={index}>
            <div className="skeleton-image" />

            <div className="skeleton-content">
              <div className="skeleton-line title" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
