interface ProductImageProps {
  imageBaseUrl: string;
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

const getImageUrl = (
  imageBaseUrl: string,
  index: number,
  size: "thumbnail" | "card" | "detail",
  format: "avif" | "webp" | "jpeg"
) => {
  const baseUrl =
    import.meta.env.VITE_MINIO_PUBLIC_URL || "https://minio.limingcn.com";
  return `${baseUrl}/solid-start/products/${imageBaseUrl}-${index}-${size}.${format}`;
};

export default function ProductImage(props: ProductImageProps) {
  if (props.isBlob) {
    return (
      <img
        src={props.imageBaseUrl}
        alt={props.alt}
        class={props.class}
        classList={props.classList}
        onClick={props.onClick}
        decoding="async"
      />
    );
  }

  return (
    <>
      <picture>
        <source
          type="image/avif"
          srcset={getImageUrl(
            props.imageBaseUrl,
            props.index,
            props.size,
            "avif"
          )}
        />
        <source
          type="image/webp"
          srcset={getImageUrl(
            props.imageBaseUrl,
            props.index,
            props.size,
            "webp"
          )}
        />
        <img
          src={getImageUrl(props.imageBaseUrl, props.index, props.size, "jpeg")}
          alt={props.alt}
          class={props.class}
          classList={props.classList}
          onTouchStart={props.onTouchStart}
          onTouchMove={props.onTouchMove}
          onTouchEnd={props.onTouchEnd}
          onClick={props.onClick}
          decoding="async"
        />
      </picture>
    </>
  );
}
export {};
