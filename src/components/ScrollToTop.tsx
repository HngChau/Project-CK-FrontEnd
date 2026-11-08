
import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .scroll-to-top {
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: #16a34a;
          color: white;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          z-index: 999;
          transition: background 0.2s, transform 0.2s;
        }

        .scroll-to-top:hover {
          background: #15803d;
          transform: translateY(-3px);
        }

        .scroll-to-top:focus-visible {
          outline: 3px solid #222;
          outline-offset: 3px;
        }

        @media (max-width: 600px) {
          .scroll-to-top {
            right: 16px;
            bottom: 16px;
            width: 42px;
            height: 42px;
          }
        }
      `}</style>

      <button
        type="button"
        className="scroll-to-top"
        onClick={() =>
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        aria-label="Quay lại đầu trang"
        title="Quay lại đầu trang"
      >
        <ChevronUp size={24} />
      </button>
    </>
  );
}
