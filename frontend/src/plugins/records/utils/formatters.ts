/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a currency value
 * @param value Number to format
 * @param currency Currency code (default: INR)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'INR'): string => {
  if (value === undefined || value === null) return '';
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return value.toString();
  }
};

/**
 * Truncate a string if it's longer than maxLength
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export const truncateString = (str: string, maxLength: number = 100): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Format a phone number to a readable format
 * @param phoneNumber Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Basic formatting for Indian phone numbers
  if (phoneNumber.length === 10) {
    return `${phoneNumber.substring(0, 5)}-${phoneNumber.substring(5)}`;
  }
  
  return phoneNumber;
};

/**
 * Convert a string to title case
 * @param str String to convert
 * @returns Title cased string
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}; 