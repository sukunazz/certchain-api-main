import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface KhaltiCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface KhaltiAmountBreakdown {
  label: string;
  amount: number;
}

export interface KhaltiProductDetail {
  identity: string;
  name: string;
  total_price: number;
  quantity: number;
  unit_price: number;
}

export interface KhaltiPaymentInitiateRequest {
  return_url: string;
  website_url: string;
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info: KhaltiCustomerInfo;
  amount_breakdown?: KhaltiAmountBreakdown[];
  product_details?: KhaltiProductDetail[];
  merchant_extra?: string;
}

export interface KhaltiPaymentInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export interface KhaltiPaymentLookupResponse {
  pidx: string;
  total_amount: number;
  status: KhaltiPaymentStatus;
  transaction_id: string;
  fee: number;
  refunded: boolean;
}

export enum KhaltiPaymentStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  REFUNDED = 'Refunded',
  EXPIRED = 'Expired',
  USER_CANCELLED = 'User canceled',
}

interface KhaltiErrorResponse {
  detail?: string;
  error_key?: string;
  return_url?: string[];
  website_url?: string[];
  [key: string]: unknown;
}

export class KhaltiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly errorKey?: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'KhaltiError';
  }
}

@Injectable()
export class KhaltiService {
  private readonly logger = new Logger(KhaltiService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl =
      this.configService.get('NODE_ENV') === 'production'
        ? 'https://a.khalti.com/api/v2'
        : 'https://a.khalti.com/api/v2';

    const secretKey = this.configService.get('KHALTI_SECRET_KEY');
    if (!secretKey) {
      throw new Error('KHALTI_SECRET_KEY is not configured');
    }

    // Configure default headers for all requests
    this.httpService.axiosRef.defaults.baseURL = this.baseUrl;
    this.httpService.axiosRef.defaults.headers.common['Authorization'] =
      `Key ${secretKey}`;
    this.httpService.axiosRef.defaults.headers.post['Content-Type'] =
      'application/json';
  }

  /**
   * Initiates a payment request to Khalti
   * @param payload Payment initiation request data
   * @returns Payment initiation response with payment URL
   */
  async initiatePayment(
    payload: KhaltiPaymentInitiateRequest,
  ): Promise<KhaltiPaymentInitiateResponse> {
    try {
      this.logger.log('payload', payload);
      const { data } = await firstValueFrom(
        this.httpService.post<KhaltiPaymentInitiateResponse>(
          '/epayment/initiate/',
          {
            ...payload,
          },
        ),
      );

      return data;
    } catch (error) {
      const axiosError = error as AxiosError<KhaltiErrorResponse>;
      this.logger.error(
        `Failed to initiate Khalti payment: ${axiosError.response?.data?.detail || axiosError.message}`,
      );

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        const validationErrors: Record<string, string[]> = {};

        // Extract validation errors if present
        Object.entries(errorData).forEach(([key, value]) => {
          if (Array.isArray(value) && key !== 'detail' && key !== 'error_key') {
            validationErrors[key] = value;
          }
        });

        throw new KhaltiError(
          errorData.detail || 'Payment initiation failed',
          axiosError.response.status,
          errorData.error_key,
          Object.keys(validationErrors).length > 0
            ? validationErrors
            : undefined,
        );
      }

      throw new KhaltiError('Failed to connect to Khalti service');
    }
  }

  /**
   * Looks up payment status using pidx
   * @param pidx Payment identifier
   * @returns Payment lookup response with status
   */
  async lookupPayment(pidx: string): Promise<KhaltiPaymentLookupResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<KhaltiPaymentLookupResponse>(
          '/epayment/lookup/',
          { pidx },
        ),
      );

      return data;
    } catch (error) {
      const axiosError = error as AxiosError<KhaltiErrorResponse>;
      this.logger.error(
        `Failed to lookup Khalti payment: ${axiosError.response?.data?.detail || axiosError.message}`,
      );

      if (axiosError.response?.data) {
        throw new KhaltiError(
          axiosError.response.data.detail || 'Payment lookup failed',
          axiosError.response.status,
          axiosError.response.data.error_key,
        );
      }

      throw new KhaltiError('Failed to connect to Khalti service');
    }
  }

  /**
   * Verifies if a payment callback is valid and completed
   * @param params Callback parameters from Khalti
   * @returns true if payment is valid and completed
   */
  async verifyPaymentCallback(
    params: Record<string, string>,
  ): Promise<boolean> {
    const { pidx, status, transaction_id, amount } = params;

    if (!pidx || !status) {
      throw new KhaltiError('Invalid callback parameters');
    }

    // For completed payments, verify with lookup
    if (status === KhaltiPaymentStatus.COMPLETED && transaction_id) {
      const lookupResult = await this.lookupPayment(pidx);

      return (
        lookupResult.status === KhaltiPaymentStatus.COMPLETED &&
        lookupResult.transaction_id === transaction_id &&
        lookupResult.total_amount === Number(amount)
      );
    }

    return false;
  }

  /**
   * Utility method to generate a unique purchase order ID
   * @param prefix Optional prefix for the order ID
   * @returns Unique purchase order ID
   */
  generatePurchaseOrderId(prefix = 'ORDER'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}_${timestamp}_${random}`;
  }
}
