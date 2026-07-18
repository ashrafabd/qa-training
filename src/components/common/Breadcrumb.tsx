import { Link } from "react-router-dom";

export function Breadcrumb({ parts }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        if (isLast) {
          return (
            <span className="current" key={`${part.label}-${index}`}>
              {part.label}
            </span>
          );
        }

        return (
          <span key={`${part.label}-${index}`}>
            <Link to={part.to}>{part.label}</Link>
            <span className="sep">/</span>
          </span>
        );
      })}
    </nav>
  );
}
