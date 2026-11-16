import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publicProfile } from "../../../mocks/fixtures/profile";
import GuestFooter from "../GuestFooter";
import RestaurantLogo from "../RestaurantLogo";
import { emptyHours } from "../openingHours";
import { MAP_CONSENT_KEY } from "../hooks/useMapConsent";
import type { PublicProfileState } from "../hooks/usePublicProfile";
import type { PublicProfile } from "../types";

const ready = (overrides: Partial<PublicProfile> = {}): PublicProfileState => ({
  status: "ready",
  profile: { ...publicProfile, ...overrides },
});

beforeEach(() => {
  localStorage.clear();
  // Monday 2026-11-16, 12:00 in Berlin.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-16T11:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("GuestFooter", () => {
  it("shows the address, today's status and Plate Vista's mark", () => {
    render(<GuestFooter state={ready()} />);

    const about = screen.getByRole("region", { name: "About Trattoria Sole" });
    expect(within(about).getByText("Neben dem Mühlweg 26")).toBeInTheDocument();
    expect(within(about).getByText("65474 Bischofsheim")).toBeInTheDocument();
    expect(within(about).getByText("Open")).toBeInTheDocument();
    expect(within(about).getByText("· until 22:00")).toBeInTheDocument();
    expect(screen.getByText("Powered by Plate Vista")).toBeInTheDocument();
  });

  it("expands to the whole week", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<GuestFooter state={ready()} />);

    const toggle = screen.getByRole("button", { name: /Opening hours/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Friday")).toBeVisible();
    expect(screen.getByText("18:00–02:00")).toBeVisible();
    expect(screen.getAllByText("Closed")).toHaveLength(5);
  });

  it("loads no map until the guest asks, and links to Google Maps either way", async () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_EMBED_KEY", "test-key");
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<GuestFooter state={ready()} />);

    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute(
      "href",
      expect.stringContaining("https://www.google.com/maps/search/?api=1&query=Trattoria%20Sole")
    );

    await user.click(screen.getByRole("button", { name: "Show map" }));
    expect(screen.getByTitle("Map showing Trattoria Sole")).toHaveAttribute(
      "src",
      expect.stringContaining("https://www.google.com/maps/embed/v1/place?key=test-key")
    );
  });

  it("remembers the guest's choice, so the map loads by itself next time until they hide it", async () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_EMBED_KEY", "test-key");
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const first = render(<GuestFooter state={ready()} />);
    await user.click(screen.getByRole("button", { name: "Show map" }));
    first.unmount();

    const { container } = render(<GuestFooter state={ready()} />);
    expect(screen.getByTitle("Map showing Trattoria Sole")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide map" }));
    expect(container.querySelector("iframe")).toBeNull();
    expect(localStorage.getItem(MAP_CONSENT_KEY)).toBeNull();
  });

  it("offers only the link when no map key is configured", () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_EMBED_KEY", ""); // A local .env must not leak in.
    render(<GuestFooter state={ready()} />);
    expect(screen.queryByRole("button", { name: "Show map" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open in Google Maps/ })).toBeInTheDocument();
  });

  it("copies the address", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // After setup: user-event installs a clipboard of its own.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<GuestFooter state={ready()} />);

    await user.click(screen.getByRole("button", { name: "Copy address" }));
    expect(writeText).toHaveBeenCalledWith("Neben dem Mühlweg 26, 65474 Bischofsheim");
    expect(await screen.findByRole("button", { name: "Address copied" })).toBeInTheDocument();
  });

  it("hides what the restaurant has not set up", () => {
    const { rerender } = render(<GuestFooter state={ready({ openingHours: emptyHours() })} />);
    expect(screen.getByText("Neben dem Mühlweg 26")).toBeInTheDocument();
    expect(screen.queryByText("Opening hours")).not.toBeInTheDocument();

    rerender(<GuestFooter state={ready({ address: null })} />);
    expect(screen.queryByRole("link", { name: /Open in Google Maps/ })).not.toBeInTheDocument();
    expect(screen.getByText("Opening hours")).toBeInTheDocument();

    rerender(<GuestFooter state={ready({ address: null, openingHours: emptyHours() })} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByText("Powered by Plate Vista")).toBeInTheDocument();
  });

  it("shows only Plate Vista's row while loading or when the profile cannot be loaded", () => {
    const { rerender } = render(<GuestFooter state={{ status: "loading", profile: null }} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    rerender(<GuestFooter state={{ status: "failed", profile: null }} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByText("Powered by Plate Vista")).toBeInTheDocument();
  });

  it("links Plate Vista's legal pages that are configured", () => {
    vi.stubEnv("VITE_IMPRINT_URL", "https://platevista.de/impressum");
    render(<GuestFooter state={ready()} />);
    const legal = screen.getByRole("navigation", { name: "Legal" });
    expect(within(legal).getByRole("link", { name: "Legal notice" })).toHaveAttribute("href", "https://platevista.de/impressum");
    expect(within(legal).queryByRole("link", { name: "Privacy policy" })).not.toBeInTheDocument();
  });
});

describe("RestaurantLogo", () => {
  it("shows the logo, the name without one, and Plate Vista's mark when the profile failed", () => {
    const { rerender } = render(<RestaurantLogo state={ready()} />);
    expect(screen.getByRole("img", { name: "Trattoria Sole" })).toHaveAttribute("src", publicProfile.logoUrl);

    rerender(<RestaurantLogo state={ready({ logoUrl: null })} />);
    expect(screen.getByText("Trattoria Sole")).toBeInTheDocument();

    rerender(<RestaurantLogo state={{ status: "failed", profile: null }} />);
    expect(screen.getByText("Plate Vista")).toBeInTheDocument();
  });
});
