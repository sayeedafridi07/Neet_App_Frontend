import { z } from "zod";

export const validate = <T>(schema: z.ZodType<T>, data: unknown) => {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true as const,
      data: result.data,
      errors: {},
    };
  }

  const errors = result.error.issues.reduce<Record<string, string>>(
    (acc, issue) => {
      const field = issue.path.join(".");

      if (!acc[field]) {
        acc[field] = issue.message;
      }

      return acc;
    },
    {},
  );

  return {
    success: false as const,
    errors,
  };
};
