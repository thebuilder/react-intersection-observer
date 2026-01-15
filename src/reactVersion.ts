import * as React from "react";

const major = Number.parseInt(React.version?.split(".")[0] ?? "", 10);
// NaN => unknown version; default to false to avoid returning ref cleanup on <19.
export const supportsRefCleanup = Number.isFinite(major) && major >= 19;
