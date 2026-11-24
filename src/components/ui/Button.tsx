import type { ButtonHTMLAttributes, ComponentChildren } from "preact";
import { cx } from "../../lib/classNames";
import styles from "./Button.module.css";

type Variant = "default" | "primary";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: Variant;
  className?: string;
};

export interface LinkButtonProps {
  href?: string;
  target?: string;
  rel?: string;
  variant?: Variant;
  children?: ComponentChildren;
}

export function Button({ variant = "default", type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, variant === "primary" && styles.primary, className)}
      {...props}
    />
  );
}

export function LinkButton({ variant = "default", href, target, rel, children }: LinkButtonProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cx(styles.button, variant === "primary" && styles.primary)}
    >
      {children}
    </a>
  );
}
