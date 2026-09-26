import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";

import { RoomStatusScreen } from "../RoomStatusScreen";
import { setLocale } from "../../lib/i18n";

function renderAt(ui: React.ReactElement) {
  setLocale("tr");
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("RoomStatusScreen", () => {
  it("misafire teknik ayrıntı göstermez, odaya katılmayı önerir", () => {
    renderAt(<RoomStatusScreen kind="notfound" audience="player" roomId="abc123" detail="permission-denied" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/abc123/)).not.toBeInTheDocument();
    expect(screen.queryByText("permission-denied")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Odaya Katıl" })).toBeInTheDocument();
  });

  it("host'a roomId ve hata ayrıntısını gösterir", () => {
    renderAt(<RoomStatusScreen kind="error" roomId="abc123" detail="permission-denied" />);
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
    expect(screen.getByText("permission-denied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yeni Oda Aç" })).toBeInTheDocument();
  });

  it("yüklenirken canlı bölge olarak duyurulur, düğme göstermez", () => {
    renderAt(<RoomStatusScreen kind="loading" audience="player" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
