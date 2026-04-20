import { apiFetch } from "../client";
import { CURRENCY_ROUTES } from "./currency.routes";
import type {
  ExchangeRateResponse,
  UpdateExchangeRateRequest,
} from "../../types/currency.types";

export async function getExchangeRate(
  token: string,
): Promise<ExchangeRateResponse> {
  return apiFetch<ExchangeRateResponse>(CURRENCY_ROUTES.exchangeRate, {
    token,
  });
}

export async function updateExchangeRate(
  token: string,
  body: UpdateExchangeRateRequest,
): Promise<ExchangeRateResponse> {
  return apiFetch<ExchangeRateResponse>(CURRENCY_ROUTES.exchangeRate, {
    method: "PATCH",
    token,
    body,
  });
}
