import type { Response } from 'express';

// Pont TypeScript -> implémentation JavaScript existante
// Évite les erreurs de d.ts manquantes tout en conservant l'implémentation JS.
// eslint-disable-next-line @typescript-eslint/no-var-requires

export function handleError(error: unknown, res: Response): void {
  return handleErrors(error, res);
}

import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export const handleErrors = (error: any, res: Response) => {
  console.log('MESSAGE:', error?.message);
  console.log('ERROR:', error?.response?.data?.message || error);
  res.status(500).send({ success: false, error: error.message });
};

export const formatedDate = (date = new Date(), format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

export const isNull = (val: string) => {
  return val === 'null' ? null : val;
};

export const generateFileNumber = () => {
  const prefixe = 'SV';
  const nombreMax = 99999999999;

  const nombreAleatoire = Math.floor(Math.random() * nombreMax) + 1;
  const nombreEnChaine = nombreAleatoire.toString().padStart(11, '0');
  const numeroDossier = prefixe + nombreEnChaine;

  return numeroDossier;
};

export const getInitial = (str: string) => {
  const words = str.split(/\s+/);
  let initials = '';

  words?.map((_word: string) => {
    initials += _word[0].toUpperCase();
  });

  return initials;
};

export const refGenerator = (prefix: string, string: string) => {
  const uuid = uuidv4();
  const orderRef = `${prefix}${string}${uuid
    .slice(uuid.length - 16, -1)
    .replace('-', '')}`;

  return orderRef.replace(' ', '');
};

export const isNotNull = (val: string | number) => {
  return (
    val !== null &&
    val !== 'null' &&
    val !== undefined &&
    val !== 'undefined' &&
    Number.isNaN(val as number) === false
  );
};
