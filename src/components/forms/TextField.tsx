import styles from "./TextField.module.css";

export interface TextFieldProps {
  id: string;
  name?: string;
  label: string;
  help?: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  autoComplete?: string;
}

export function TextField({
  id,
  name = id,
  label,
  help,
  type = "text",
  required = false,
  autoComplete,
}: TextFieldProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </span>

      {help && <small className={styles.help}>{help}</small>}

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        // Preact's typings require `list` for text-like input types. undefined means no datalist.
        list={undefined}
        className={styles.input}
      />
    </label>
  );
}
