import { useQuery } from "@tanstack/solid-query";
import { createSignal, createEffect } from "solid-js";
import type { Photo } from "~/db/schema";

interface VehicleImageProps {
  vehicleId: string;
  index: number;
  size: "thumbnail" | "card" | "detail";
  alt: string;
  class?: string;
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: () => void;
  onClick?: () => void;
  classList?: Record<string, boolean>;
  isBlob?: boolean;
}

async function fetchVehiclePhotos(vehicleId: string): Promise<Photo[]> {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/vehicles/${vehicleId}/photos`);
  if (!res.ok) {
    throw new Error("Failed to fetch vehicle photos");
  }
  return res.json();
}

export default function VehicleImage(props: VehicleImageProps) {
  const photosQuery = useQuery(() => ({
    queryKey: ["vehiclePhotos", props.vehicleId],
    queryFn: () => fetchVehiclePhotos(props.vehicleId),
    enabled: !props.isBlob,
  }));

  if (props.isBlob) {
    return (
      <img
        src={props.alt} // Blobs are passed in alt for now
        alt={props.alt}
        class={props.class}
        classList={props.classList}
        onClick={props.onClick}
        decoding="async"
      />
    );
  }

  const getImageUrl = (photo: Photo | undefined) => {
    if (!photo || !photo.photo_url) return undefined;
    // Assuming photo_url is the full URL
    // Or you can construct it here based on your storage solution
    return photo.photo_url;
  };

  const [imageSrc, setImageSrc] = createSignal<string | undefined>(
    getImageUrl(photosQuery.data?.[props.index])
  );

  createEffect(() => {
    setImageSrc(getImageUrl(photosQuery.data?.[props.index]));
  });

  const handleImageError = () => {
    // Fallback to a simple placeholder image (data URL to avoid CORS issues)
    const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">Image not available</text>
      </svg>
    `)}`;
    setImageSrc(placeholderSvg);
  };

  return (
    <picture>
      {/* This component will need to be updated to handle different formats if required */}
      <img
        src={imageSrc()}
        alt={props.alt}
        class={props.class}
        classList={props.classList}
        onTouchStart={props.onTouchStart}
        onTouchMove={props.onTouchMove}
        onTouchEnd={props.onTouchEnd}
        onClick={props.onClick}
        onError={handleImageError}
        decoding="async"
      />
    </picture>
  );
}
