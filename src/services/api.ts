// Back-compat shim: the real client now lives in `shared/api/client.ts`
// (FE-01 target structure). Existing imports of `services/api` keep working
// without touching every admin/staff file that still imports from here.
export { default } from "../shared/api/client";
