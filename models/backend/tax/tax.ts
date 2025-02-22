export enum TaxTreatment {
    FIFO = 'FIFO',
    LIFO = 'LIFO',
    CUSTOM = 'CUSTOM',
    MAX_PROFIT = 'MAX_PROFIT',
    MIN_PROFIT = 'MIN_PROFIT'
}

export interface TaxableEventParameters {
    sellId: string;
    taxTreatment: TaxTreatment;
    buyTransactionIds?: string[];
}

export interface TaxReportRequest {
    requestId: string;
    taxableEvents: TaxableEventParameters[];
}