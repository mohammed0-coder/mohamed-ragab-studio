import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mohamed Ragab Studio",
    short_name: "MRS",
    description: "Creative studio for brands, digital products and visual experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#f4f1ea",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/brand/MRS_Black_Vertical.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/brand/MRS_Black_Vertical.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
