import { z } from "zod";

const nameText = z.string().trim().min(2).max(100).regex(/^[\p{L}\s'-]+$/u, "Solo se permiten letras y espacios.");

export const credentialsSchema = z.object({
  email: z.email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128),
});

export const setupSchema = credentialsSchema.extend({
  name: nameText,
});

export const studentSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos."),
  institutionalCode: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9-]+$/),
  firstNames: nameText,
  lastNames: nameText,
  consent: z.literal(true),
  descriptor: z.array(z.number().finite().min(-10).max(10)).length(128),
  samples: z.number().int().min(1).max(5),
});

export const studentUpdateSchema = z.object({
  dni: z.string().regex(/^\d{8}$/),
  institutionalCode: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9-]+$/),
  firstNames: nameText,
  lastNames: nameText,
  status: z.enum(["active", "inactive"]),
});

export const attendanceSchema = z.object({
  descriptor: z.array(z.number().finite().min(-10).max(10)).length(128),
  livenessVerified: z.literal(true),
});

export const courseSchema = z.object({
  code: z.string().trim().min(2).max(20).regex(/^[A-Za-z0-9-]+$/),
  name: z.string().trim().min(3).max(120),
});
