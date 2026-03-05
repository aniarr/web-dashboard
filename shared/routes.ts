import { z } from 'zod';
import { insertReportSchema, type Report, type User } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.object({
          user: z.custom<User>(),
          token: z.string()
        }),
        401: errorSchemas.unauthorized,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({
        email: z.string().email(),
        name: z.string(),
        password: z.string(),
      }),
      responses: {
        201: z.object({
          user: z.custom<User>(),
          token: z.string()
        }),
        400: errorSchemas.validation,
      }
    }
  },
  reports: {
    list: {
      method: 'GET' as const,
      path: '/api/reports' as const,
      responses: {
        200: z.array(z.custom<Report>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/reports' as const,
      input: insertReportSchema,
      responses: {
        201: z.custom<Report>(),
        400: errorSchemas.validation,
      }
    }
  },
  admin: {
    members: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/members' as const,
        responses: {
          200: z.array(z.custom<User>()),
        }
      }
    },
    reports: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/reports' as const,
        responses: {
          200: z.array(z.custom<Report>()),
        }
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
