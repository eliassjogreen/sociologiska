import type { GenericEventHandler } from "preact";
import styles from "./CheckboxField.module.css";

export interface CheckboxFieldProps {
  id: string;
  name?: string;
  label: string;
  required?: boolean;
  checked?: boolean;
  onChange?: GenericEventHandler<HTMLInputElement>;
}

export function CheckboxField({
  id,
  name = id,
  label,
  required = false,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        checked={checked}
        onChange={onChange}
        className={styles.input}
      />
      <span className={styles.text}>{label}</span>
    </label>
  );
}
