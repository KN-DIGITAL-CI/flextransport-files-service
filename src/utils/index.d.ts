// Déclarations de types pour les utilitaires JavaScript non typés
declare module './functions' {
  import type { Response } from 'express';
  export function handleError(error: unknown, res: Response): void;
}
