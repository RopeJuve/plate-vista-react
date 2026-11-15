import { http, HttpResponse } from "msw";
import type { RestaurantProfileInput } from "../../features/restaurant-profile/types";
import { emptyProfile, publicProfile } from "../fixtures/profile";
import { apiPaths } from "./paths";

export const profileHandlers = [
  http.get(apiPaths.profile, () => HttpResponse.json(emptyProfile)),
  http.put(apiPaths.profile, async ({ request }) => {
    const body = (await request.json()) as RestaurantProfileInput;
    return HttpResponse.json({
      ...emptyProfile,
      ...body,
      usesLegalAddress: !body.address,
    });
  }),
  http.get(apiPaths.publicProfile, () => HttpResponse.json(publicProfile)),
];
