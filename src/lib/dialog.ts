import type { MouseEvent } from "react";

// Fallback for closedby="any": closes a modal <dialog> when its backdrop is tapped.
// The dialog's own padding is also event.target === dialog, so only close when
// the click lands outside the dialog's box.
export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
  const dialog = event.currentTarget;
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right
    || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) dialog.close();
}
