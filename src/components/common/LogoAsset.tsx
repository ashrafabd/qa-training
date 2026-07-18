import { IstqbMark } from "../../assets/icons";

export function logoNode(slug, size = 22) {
  if (slug === "istqb") return <IstqbMark size={size} />;
  return (
    <img
      className="logo-img"
      alt={slug}
      loading="lazy"
      width={size}
      height={size}
      src={`https://cdn.simpleicons.org/${slug}`}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export function LogoTile({ slug, label, size = 18 }) {
  return (
    <span className="logo-tile">
      {logoNode(slug, size)}
      {label ? <span>{label}</span> : null}
    </span>
  );
}
