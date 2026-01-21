import { render, screen } from "@testing-library/react";
import Home from "../app/page";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe("Home Page", () => {
  it("renders the welcome message", () => {
    render(<Home />);

    expect(screen.getByText("Welcome to Quiz Builder")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<Home />);

    expect(
      screen.getByText(/Create custom quizzes with various question types/i),
    ).toBeInTheDocument();
  });

  it("renders create quiz link", () => {
    render(<Home />);

    const createLink = screen.getByRole("link", { name: /create a quiz/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/create");
  });

  it("renders view quizzes link", () => {
    render(<Home />);

    const viewLink = screen.getByRole("link", { name: /view all quizzes/i });
    expect(viewLink).toBeInTheDocument();
    expect(viewLink).toHaveAttribute("href", "/quizzes");
  });
});
