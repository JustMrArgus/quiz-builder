"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuizzes, getQuiz, createQuiz, deleteQuiz } from "@/lib/api";
import { CreateQuizInput } from "@/lib/types";

export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: () => [...quizKeys.lists()] as const,
  details: () => [...quizKeys.all, "detail"] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
};

export const useQuizzes = () => {
  return useQuery({
    queryKey: quizKeys.list(),
    queryFn: getQuizzes,
  });
};

export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => getQuiz(id),
    enabled: !!id,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizInput) => createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};
