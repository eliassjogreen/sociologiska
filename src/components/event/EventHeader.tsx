import styles from "./EventHeader.module.css";

export interface EventHeaderProps {
  name: string;
  description?: string;
  imageSrc?: string;
  imageSrcSet?: string;
  imageAlt?: string;
}

export function EventHeader({
  name,
  description,
  imageSrc,
  imageSrcSet,
  imageAlt,
}: EventHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Anmälan till {name}</h1>

      {imageSrc && (
        <img src={imageSrc} srcSet={imageSrcSet} alt={imageAlt} className={styles.image} />
      )}

      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
