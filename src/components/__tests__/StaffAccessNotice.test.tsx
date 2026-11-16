import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import type { User } from "firebase/auth";

vi.mock("../../lib/firebase", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }));

import { StaffAccessNotice } from "../StaffAccessNotice";
import { setLocale } from "../../lib/i18n";

function renderNotice(user: User | null) {
  setLocale("de");
  return render(
    <MemoryRouter>
      <StaffAccessNotice titleKey="admin.venueTitle" user={user} />
    </MemoryRouter>,
  );
}

describe("StaffAccessNotice", () => {
  it("girişsiz ziyaretçiye arayüz dilinde giriş yolunu gösterir", () => {
    renderNotice(null);
    expect(screen.getByRole("heading", { name: "Location-Einstellungen" })).toBeInTheDocument();
    expect(screen.getByText(/Betriebskonto/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ANMELDEN" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText(/işletme hesabıyla/)).not.toBeInTheDocument();
  });

  it("personel olmayan hesaba nedenini ve çıkışı gösterir", () => {
    renderNotice({ uid: "u1", email: "gast@example.com" } as User);
    expect(screen.getByText("gast@example.com")).toBeInTheDocument();
    expect(screen.getByText(/ist kein Personalkonto/)).toBeInTheDocument();
    expect(screen.getByText("staff/u1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ABMELDEN" })).toBeInTheDocument();
  });
});
