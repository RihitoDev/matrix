// TODO: confirmar el código de Beni (BE) contra una fuente oficial; está sin verificar
export const ID_CARD_ISSUED_IN = ['CB', 'LP', 'SC', 'OR', 'PT', 'CH', 'TJ', 'BE', 'PD'] as const;

export type IdCardIssuedIn = (typeof ID_CARD_ISSUED_IN)[number];
