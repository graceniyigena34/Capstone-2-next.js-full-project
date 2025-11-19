import { z } from 'zod'

export const commentSchema = z.object({
  content: z.string().min(3, 'Comment is too short'),
  parentId: z.string().optional(),
})

export type CommentPayload = z.infer<typeof commentSchema>

