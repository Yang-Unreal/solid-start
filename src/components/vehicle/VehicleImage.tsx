import { Show } from "solid-js";

interface VehicleImageProps {
  photoUrl?: string | null;
  alt?: string;
  class?: string;
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onClick?: () => void;
}

export default function VehicleImage(props: VehicleImageProps) {
  return (
    <Show
      when={props.photoUrl}
      fallback={<div class={`bg-gray-200 ${props.class || ""}`} />}
    >
      <img
        src={props.photoUrl!}
        alt={props.alt || "Vehicle image"}
        class={props.class}
        onTouchStart={props.onTouchStart}
        onTouchMove={props.onTouchMove}
        onTouchEnd={props.onTouchEnd}
        onClick={props.onClick}
      />
    </Show>
  );
}
