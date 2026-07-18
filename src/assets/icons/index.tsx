import { FaArrowUp, FaBars, FaMoon, FaPrint, FaSearch, FaSun, FaTimes } from "react-icons/fa";

export const Icons = {
  Search: FaSearch,
  Print: FaPrint,
  Moon: FaMoon,
  Sun: FaSun,
  Bars: FaBars,
  Close: FaTimes,
  Up: FaArrowUp
};

export function IstqbMark({ size = 18 }) {
  return (
    <span className="istqb-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size} height={size} aria-label="ISTQB">
        <path fill="#1f6feb" d="M5 2h14a2 2 0 0 1 2 2v13l-9 5-9-5V4a2 2 0 0 1 2-2z" />
        <path fill="#fff" d="M10.3 15.2 7.1 12l1.4-1.4 1.8 1.8 4-4.2L15.8 9.6z" />
      </svg>
    </span>
  );
}
