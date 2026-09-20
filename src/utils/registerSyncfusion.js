import { registerLicense } from "@syncfusion/ej2-base";

const syncfusionKey = import.meta.env.VITE_SYNCFUSION_KEY;

if (syncfusionKey) {
  registerLicense(syncfusionKey);
}
