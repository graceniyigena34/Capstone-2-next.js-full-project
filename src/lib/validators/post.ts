import { z } from 'zod'

export const postPayloadSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters').max(140, 'Title is too long'),
  content: z.string().min(20, 'Write a bit more to publish this post'),
  tags: z.array(z.string().min(2)).max(8).default([]),
  coverImage: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined))
    .or(z.undefined()),
  published: z.boolean().optional().default(false),
})

export const updatePostSchema = postPayloadSchema.partial().extend({
  slug: z.string().optional(),
})

export type PostPayload = z.infer<typeof postPayloadSchema>
export type UpdatePostPayload = z.infer<typeof updatePostSchema>

