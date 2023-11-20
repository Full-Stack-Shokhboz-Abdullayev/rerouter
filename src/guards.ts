import { UnauthorizedException } from '@nestjs/common';

export const adminGuard = (request: { headers: Record<string, string> }) => {
  (request.headers['authorization'] || request.headers['Authorization']) !==
    process.env.ADMIN_TOKEN &&
    (() => {
      throw new UnauthorizedException();
    })();
};

export const webhookGuard = (request: { headers: Record<string, string> }) =>
  (request.headers['authorization'] || request.headers['Authorization']) ===
  process.env.WEBHOOK_TOKEN;
