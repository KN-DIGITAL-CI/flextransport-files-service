import type { Response } from 'express';

declare module './functions' {
  export function handleError(error: unknown, res: Response): void;
}

