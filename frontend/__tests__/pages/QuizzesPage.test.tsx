import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as api from "@/lib/api";

jest.mock("@/lib/api");
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

const mockedApi = api as jest.Mocked<typeof api>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

import QuizzesPage from "@/app/quizzes/page";

describe("Quizzes Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state with spinner", () => {
    mockedApi.getQuizzes.mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <QuizzesPage />
      </TestWrapper>,
    );

    const spinner = document.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders empty state when no quizzes", async () => {
    mockedApi.getQuizzes.mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <QuizzesPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText(/no quizzes found/i)).toBeInTheDocument();
    });
  });

  it("renders quiz list", async () => {
    const mockQuizzes = [
      {
        id: "1",
        title: "JavaScript Basics",
        questionCount: 10,
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        title: "React Fundamentals",
        questionCount: 5,
        createdAt: "2024-01-02T00:00:00Z",
      },
    ];

    mockedApi.getQuizzes.mockResolvedValueOnce(mockQuizzes);

    render(
      <TestWrapper>
        <QuizzesPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("JavaScript Basics")).toBeInTheDocument();
    });
    expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
  });

  it("renders error state with error message", async () => {
    mockedApi.getQuizzes.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(
      <TestWrapper>
        <QuizzesPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });
  });

  it("shows question count for each quiz", async () => {
    const mockQuizzes = [
      {
        id: "1",
        title: "Test Quiz",
        questionCount: 15,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    mockedApi.getQuizzes.mockResolvedValueOnce(mockQuizzes);

    render(
      <TestWrapper>
        <QuizzesPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText(/15 questions/i)).toBeInTheDocument();
    });
  });

  it("renders page title after loading", async () => {
    mockedApi.getQuizzes.mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <QuizzesPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("All Quizzes")).toBeInTheDocument();
    });
  });

  it("renders create new quiz link", async () => {
    mockedApi.getQuizzes.mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <QuizzesPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText(/no quizzes found/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /create your first quiz/i }),
    ).toBeInTheDocument();
  });
});
