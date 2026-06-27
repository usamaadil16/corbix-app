// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomeExperience } from "@/components/public/home/HomeExperience";
import type { Service } from "@/types/database";

const services: Service[] = [
  {
    id: "1",
    slug: "market-entry",
    title: "Market Entry",
    description: "Land and expand in new markets.",
    visible: true,
    has_page: true,
    sort_order: 1,
  },
];

describe("HomeExperience", () => {
  it("renders the mountain hero headline and stacked sections", () => {
    render(
      <HomeExperience
        heroHeadline="We build the future of real estate"
        slogan="One partner."
        brandTitle="COR / BRIX"
        brandStory="Core trust and building blocks."
        vision="Where we are headed."
        services={services}
      />,
    );
    expect(
      screen.getByText("We build the future of real estate"),
    ).toBeTruthy();
    expect(screen.getByText("Services Hub")).toBeTruthy();
    expect(screen.getByText("Market Entry")).toBeTruthy();
  });
});
