import { z } from "zod";

export const config = {
  name: "Initialize",
  endpoint: "node-agent",
  subscribes: ["dbz.initialize"],
  emits: ["dbz.search-customer", "dbz.error"],
};

export default async (input, emit) => {
  const schema = z.object({
    venuePhoneNumber: z.string().min(1),
    customerPhoneNumber: z.string().min(1),
  });

  const validation = schema.safeParse(input);

  if (!validation.success) {
    await emit({
      type: "dbz.error",
      data: { message: "input validation error" },
    });
    return;
  }

  await emit({
    type: "dbz.search-customer",
    data: {
      venuePhoneNumber: input.venuePhoneNumber,
      customerPhoneNumber: input.customerPhoneNumber,
    },
  });
}