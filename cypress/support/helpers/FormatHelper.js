/**
 * FormatHelper
 * ----------------------------------------------------------------------
 * Purpose:
 * Provides utility methods for formatting common identifiers and dates
 * used throughout the application (e.g., Savings ID, PNID, GL Code, dates, etc).
 *
 * Usage:
 * - Imported as a singleton instance.
 * - All methods are pure functions that handle null/undefined.
 *
 * @author Michael
 */
class FormatHelper {
    // helper to format savings id
    formatSavingsID(savingsid) {
        const digits = String(savingsid ?? '').replace(/\D/g, '');
        const ten = digits.length > 10 ? digits.slice(-10) : digits.padStart(10, '0');
        return `${ten.slice(0, 3)}-${ten.slice(3, 6)}-${ten.slice(6, 10)}`;
    }

    // helper to format pnid
    formatPNID(pnid) {
        const digits = String(pnid ?? '').replace(/\D/g, '');
        const formattedpnid = digits.length > 12 ? digits.slice(-12) : digits.padStart(12, '0');
        return formattedpnid;
    }

    // helper to format glcode
    formatGLCode(glcode) {
        const digits = String(glcode ?? '').replace(/\D/g, '');
        const formattedglcode = digits.padStart(4, '0');
        return formattedglcode
    }

    // helper to format dates
    dateFormat(date, format = 'y-m-d') {
        if (!date) return '';

        let dateObj;

        // Handle different input formats
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            // Handle MM/DD/YYYY format (like "11/15/2025")
            if (date.includes('/')) {
                const [month, day, year] = date.split('/');
                dateObj = new Date(year, month - 1, day); // month is 0-indexed
            } else {
                dateObj = new Date(date);
            }
        } else {
            dateObj = new Date(date);
        }

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        // Handle different format patterns
        switch (format.toLowerCase()) {
            case 'y-m-d':
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            case 'm/d/y':
            case 'mm/dd/yyyy':
                return `${month}/${day}/${year}`;
            case 'd/m/y':
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'd-m-y':
            case 'dd-mm-yyyy':
                return `${day}-${month}-${year}`;
            default:
                return `${year}-${month}-${day}`; // default to y-m-d format
        }
    }
}

export default new FormatHelper();