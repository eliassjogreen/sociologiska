import { useLastNonNull } from "../../hooks/useLastNonNull";
import type { WaitState } from "../../hooks/useEventRegistration";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

const WAIT_MESSAGES = {
  payment: {
    title: "Laddar betalning...",
    text: "Vänta medans vi laddar betalningen. Detta borde gå snabbt.",
  },
  confirming: {
    title: "Sparar anmälan",
    text: "Vi skickar dig snart vidare... Tack för din anmälan!",
  },
};

export function WaitDialog({ state }: { state: WaitState }) {
  const shown = useLastNonNull(state);
  const message = shown ? WAIT_MESSAGES[shown] : undefined;

  return (
    <Dialog
      open={state !== null}
      label="Laddar betalning"
      title={message?.title}
      text={message?.text}
    />
  );
}

export function ErrorDialog({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  const shown = useLastNonNull(message);

  return (
    <Dialog
      open={message !== null}
      label="Felmeddelande"
      title="Något gick fel"
      text={shown ?? undefined}
      onClose={onDismiss}
      actions={[
        <Button variant="primary" onClick={onDismiss}>
          Stäng
        </Button>,
      ]}
    />
  );
}
