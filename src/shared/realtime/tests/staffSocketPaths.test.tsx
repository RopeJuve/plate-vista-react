import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { clearTokens, saveTokens } from "../../api/tokens";
import { useRealtime } from "../RealtimeProvider";

const StatusProbe = () => <p>{useRealtime().status}</p>;

const renderAt = (path: string) => {
  saveTokens({ accessToken: "test-token" });
  render(
    <RealtimeTestProviders realtime={createMockRealtime()} path={path}>
      <StatusProbe />
    </RealtimeTestProviders>
  );
};

afterEach(() => clearTokens());

describe("staff socket", () => {
  it.each(["/bar", "/admin/kasse"])("connects on %s", async (path) => {
    renderAt(path);
    expect(await screen.findByText("open")).toBeInTheDocument();
  });

  it("stays closed on other admin pages", () => {
    renderAt("/admin/menu");
    expect(screen.getByText("closed")).toBeInTheDocument();
  });
});
