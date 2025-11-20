export interface NavLinkConfig {
  href: string;
  label: string;
  image: string;
  hiddenOnMobile: boolean;
}

export const NAV_LINKS: NavLinkConfig[] = [
  { 
    href: "/product", 
    label: "PRODUCT", 
    image: "/images/menu/PRODUCT.webp",
    hiddenOnMobile: false 
  },
  { 
    href: "/services", 
    label: "SERVICES", 
    image: "/images/menu/SERVICES.webp",
    hiddenOnMobile: true 
  },
  { 
    href: "/about", 
    label: "ABOUT", 
    image: "/images/menu/ABOUT.webp",
    hiddenOnMobile: true 
  },
  { 
    href: "/contact", 
    label: "CONTACT", 
    image: "/images/menu/CONTACT.webp",
    hiddenOnMobile: false 
  },
];
