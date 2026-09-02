import { useContext } from "react";
import { VendorProfileContext } from "./VendorProfileContext";
import type { VendorProfileContextValue } from "./VendorProfileContext";

export function useVendorProfile(): VendorProfileContextValue {
  const context = useContext(VendorProfileContext);
  if (!context) {
    throw new Error(
      "useVendorProfile must be used within a VendorProfileProvider",
    );
  }
  return context;
}
