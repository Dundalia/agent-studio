'use client';

type MobileMenuToggleProps = {
  isOpen: boolean;
  onClick: () => void;
};

export default function MobileMenuToggle({ isOpen, onClick }: MobileMenuToggleProps) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-50 bg-stone-800 p-1.5 rounded-md"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="w-5 h-4 relative flex flex-col justify-between">
        <span
          className={`block h-0.5 w-full bg-stone-300 transition-transform duration-300 ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`block h-0.5 bg-stone-300 transition-opacity duration-300 ${
            isOpen ? 'opacity-0 w-0' : 'opacity-100 w-full'
          }`}
        />
        <span
          className={`block h-0.5 w-full bg-stone-300 transition-transform duration-300 ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </div>
    </button>
  );
}
