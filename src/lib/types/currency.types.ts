export type Currency = "RWF" | "USD";

export interface ExchangeRateResponse {
  baseCurrency: Currency;
  targetCurrency: Currency;
  rate: number;
  updatedAt: string | null;
}

export interface UpdateExchangeRateRequest {
  rate: number;
}
