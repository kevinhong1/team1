import React from "react";
import { createRoot } from "react-dom/client";
import LoaderScene from "./LoaderScene";

const rootElement = document.getElementById("loader-root");
const root = createRoot(rootElement);

root.render(
  <LoaderScene
    word="BrandName"
    onComplete={() => {
      // Once finished, unmount React root (removes loader overlay)
      root.unmount();
      // Optionally show other elements that were hidden
      const wordmark = document.getElementById("navbar-brand-wordmark");
      if (wordmark) wordmark.style.opacity = 1;
    }}
  />
);
