// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MountainHero } from "@/components/public/home/MountainHero";

describe("MountainHero", () => {
  it("renders the headline and slogan", () => {
    render(
      <MountainHero
        heroHeadline="We build the future of real estate"
        slogan="Your single unified partner for local growth and global expansion."
      />,
    );
    expect(
      screen.getByText("We build the future of real estate"),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Your single unified partner for local growth and global expansion.",
      ),
    ).toBeTruthy();
  });

  it("renders five stacked ridge layers", () => {
    render(<MountainHero heroHeadline="x" slogan="y" />);
    for (let i = 1; i <= 5; i += 1) {
      expect(screen.getByTestId(`ridge-${i}`)).toBeTruthy();
    }
  });
});
