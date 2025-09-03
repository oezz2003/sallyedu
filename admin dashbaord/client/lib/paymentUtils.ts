// Utility functions for safely handling payment data
// This file contains helper functions to handle different data formats in payment records

/**
 * Ultra-safe currency code extractor that prevents React child rendering errors
 * @param currency The currency field from a payment record
 * @returns The currency code as a string (e.g., 'USD')
 */
export function getCurrencyCode(currency: any): string {
  try {
    // Handle undefined or null currency
    if (!currency) {
      return 'USD'; // Default to USD
    }
    
    // Handle string format
    if (typeof currency === 'string') {
      return String(currency).toUpperCase();
    }
    
    // Handle object format { currency: string, amount: number } or { amount: number, currency: string }
    if (typeof currency === 'object' && currency !== null) {
      // Check if it's the expected format
      if ('currency' in currency && currency.currency) {
        if (typeof currency.currency === 'string') {
          return String(currency.currency).toUpperCase();
        }
        // Handle nested currency object
        if (typeof currency.currency === 'object' && currency.currency.currency) {
          return String(currency.currency.currency).toUpperCase();
        }
      }
      
      // Log unexpected object structure for debugging but never throw
      console.warn('Unexpected currency object structure:', currency);
    }
    
    // Fallback - convert whatever it is to string
    return String(currency).toUpperCase() || 'USD';
  } catch (error) {
    console.error('Error in getCurrencyCode:', error, currency);
    return 'USD';
  }
}

/**
 * Ultra-safe currency amount extractor that prevents React child rendering errors
 * @param currency The currency field from a payment record
 * @returns The currency amount as a number
 */
export function getCurrencyAmount(currency: any): number {
  try {
    // Handle undefined or null currency
    if (!currency) {
      return 0;
    }
    
    // Handle object format { currency: string, amount: number } or { amount: number, currency: string }
    if (typeof currency === 'object' && currency !== null) {
      // Check if it's already the expected format
      if ('amount' in currency && currency.amount !== undefined && currency.amount !== null) {
        const amount = parseFloat(String(currency.amount));
        return isNaN(amount) ? 0 : amount;
      }
      
      // Handle case where currency might be nested
      if ('currency' in currency && typeof currency.currency === 'object' && currency.currency !== null) {
        if ('amount' in currency.currency && currency.currency.amount !== undefined) {
          const amount = parseFloat(String(currency.currency.amount));
          return isNaN(amount) ? 0 : amount;
        }
      }
      
      // Log unexpected object structure for debugging
      console.warn('Unexpected currency object structure for amount extraction:', currency);
    }
    
    // For string format or other cases, try to parse as number
    if (typeof currency === 'string' || typeof currency === 'number') {
      const amount = parseFloat(String(currency));
      return isNaN(amount) ? 0 : amount;
    }
    
    return 0;
  } catch (error) {
    console.error('Error in getCurrencyAmount:', error, currency);
    return 0;
  }
}

/**
 * Ultra-safely renders a currency value, ensuring no objects are returned as React children
 * @param currency The currency field from a payment record
 * @returns A safely rendered currency string
 */
export function safeRenderCurrency(currency: any): string {
  try {
    const currencyCode = getCurrencyCode(currency);
    // Ensure we always return a string, never an object
    const result = typeof currencyCode === 'string' ? currencyCode : String(currencyCode || 'USD');
    
    // Additional safety check - make sure it's really a string
    if (typeof result !== 'string') {
      console.warn('safeRenderCurrency: Non-string result detected, converting:', result);
      return String(result || 'USD');
    }
    
    return result;
  } catch (error) {
    console.error('Error rendering currency:', error, currency);
    return 'USD';
  }
}

/**
 * Ultra-safely renders an amount value, ensuring no objects are returned as React children
 * @param amount The amount field from a payment record
 * @returns A safely rendered amount string
 */
export function safeRenderAmount(amount: any): string {
  try {
    if (amount === null || amount === undefined) {
      return '0';
    }
    
    let numericAmount = 0;
    
    if (typeof amount === 'number') {
      numericAmount = amount;
    } else if (typeof amount === 'string') {
      numericAmount = parseFloat(amount);
    } else if (typeof amount === 'object' && amount !== null) {
      // Try to extract amount from object
      if ('amount' in amount && amount.amount !== undefined) {
        numericAmount = parseFloat(String(amount.amount));
      } else {
        console.warn('Unexpected amount object structure:', amount);
      }
    } else {
      numericAmount = parseFloat(String(amount));
    }
    
    // Ensure we have a valid number
    if (isNaN(numericAmount)) {
      return '0';
    }
    
    // Format and return as string
    const result = numericAmount.toLocaleString();
    
    // Additional safety check
    if (typeof result !== 'string') {
      console.warn('safeRenderAmount: Non-string result detected, converting:', result);
      return String(result || '0');
    }
    
    return result;
  } catch (error) {
    console.error('Error rendering amount:', error, amount);
    return '0';
  }
}

/**
 * Ultra-safe payment data sanitizer for React rendering
 * @param payment Raw payment data
 * @returns Sanitized payment data safe for React rendering
 */
export function sanitizePaymentForReact(payment: any): any {
  try {
    if (!payment || typeof payment !== 'object') {
      return {
        id: '',
        amount: 0,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'unknown'
      };
    }
    
    return {
      ...payment,
      id: String(payment?.id || ''),
      amount: typeof payment?.amount === 'number' ? payment.amount : 0,
      currency: safeRenderCurrency(payment?.currency),
      status: String(payment?.status || 'pending'),
      paymentMethod: String(payment?.paymentMethod || 'unknown'),
      transactionId: payment?.transactionId ? String(payment.transactionId) : undefined,
      paymentDate: String(payment?.paymentDate || new Date().toISOString()),
      refundAmount: typeof payment?.refundAmount === 'number' ? payment.refundAmount : undefined
    };
  } catch (error) {
    console.error('Error sanitizing payment for React:', error, payment);
    return {
      id: '',
      amount: 0,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'unknown'
    };
  }
}

export default { getCurrencyCode, getCurrencyAmount, safeRenderCurrency, safeRenderAmount, sanitizePaymentForReact };