// Owners sign in at /login with their email. Everyone else signs in inside
// their restaurant at /staff/<slug>/login, because staff names are only
// unique within a restaurant.

export const OWNER_LOGIN_PATH = "/login";

const STAFF_SLUG_KEY = "staffRestaurantSlug";
const LOGIN_KIND_KEY = "lastLoginKind";

export type LoginKind = "owner" | "staff";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: the device just won't remember.
  }
};

export const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

// Kept across logouts so a bar tablet reopens on its own restaurant.
export const rememberStaffRestaurant = (slug: string) => write(STAFF_SLUG_KEY, normalizeSlug(slug));

export const rememberedStaffRestaurant = () => read(STAFF_SLUG_KEY) || "";

export const staffLoginPath = (slug = rememberedStaffRestaurant()) =>
  slug ? `/staff/${encodeURIComponent(slug)}/login` : "/staff/login";

export const rememberLoginKind = (kind: LoginKind) => write(LOGIN_KIND_KEY, kind);

// Where to send someone whose session ended: back to the login they used.
export const getLoginPath = () =>
  read(LOGIN_KIND_KEY) === "staff" ? staffLoginPath() : OWNER_LOGIN_PATH;
