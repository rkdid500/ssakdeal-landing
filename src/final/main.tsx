import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import SakdLanding from "./SakdLanding";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SakdLanding assetBase={`${import.meta.env.BASE_URL}assets/`} />
  </StrictMode>,
);
