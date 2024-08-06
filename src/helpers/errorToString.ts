import { z } from "zod";

const HasMessage = z.object({
  message: z.string(),
});

export default function errorToString(e: unknown) {
  const parseResult = HasMessage.safeParse(e);

  if (parseResult.success) {
    return parseResult.data.message;
  }

  return JSON.stringify(e);
}
