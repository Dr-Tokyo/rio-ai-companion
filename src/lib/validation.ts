import { z } from "zod";

export const messageSchema = z.string().trim().min(1, "Message cannot be empty").max(10000, "Message too long");

export const flashcardSchema = z.object({
  front: z.string().trim().min(1, "Front text required").max(500, "Front text too long"),
  back: z.string().trim().min(1, "Back text required").max(2000, "Back text too long"),
  subject: z.string().trim().min(1, "Subject required").max(100, "Subject name too long"),
});

export const quizTopicSchema = z.string().trim().min(3, "Topic must be at least 3 characters").max(200, "Topic too long");

export const conversationTitleSchema = z.string().trim().min(1, "Title required").max(200, "Title too long");

export const studyNoteSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(200, "Title too long"),
  content: z.string().trim().min(1, "Content required").max(50000, "Content too long"),
  subject: z.string().trim().min(1, "Subject required").max(100, "Subject name too long"),
});
