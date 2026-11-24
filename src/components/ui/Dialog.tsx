import type { ComponentChild } from "preact";
import { useEffect, useRef } from "preact/hooks";
import styles from "./Dialog.module.css";

export interface DialogProps {
  open: boolean;
  label: string;
  title?: string;
  text?: string;
  /** Called after the user closes the dialog (Escape). Without it, Escape is ignored. */
  onClose?: () => void;
  children?: ComponentChild;
  actions?: ComponentChild[];
}

export function Dialog({ open, label, title, text, onClose, children, actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={label}
      onCancel={(event) => {
        if (!onClose) {
          event.preventDefault();
        }
      }}
      onClose={() => {
        // The close event is async, so skip it if the dialog was reopened in the meantime.
        if (!ref.current?.open) {
          onClose?.();
        }
      }}
    >
      <article className={styles.content}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {text && <p className={styles.text}>{text}</p>}
        {children}
        {actions && (
          <menu role="list" className={styles.actions}>
            {actions.filter(Boolean).map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </menu>
        )}
      </article>
    </dialog>
  );
}
