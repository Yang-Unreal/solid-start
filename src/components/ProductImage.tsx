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
}

const getImageUrl = (
  imageBaseUrl: string,
  index: number,
  size: "thumbnail" | "card" | "detail",
  format: "avif" | "webp" | "jpeg"
) => {
  return `https://minio.limingcn.com/solid-start/products/${imageBaseUrl}-${index}-${size}.${format}`;
};

export default function ProductImage(props: ProductImageProps) {
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
          loading="lazy"
          decoding="async"
        />
      </picture>
    </>
  );
}
