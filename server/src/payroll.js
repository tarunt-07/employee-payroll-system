export const OT_RATE = 150;
export const PROFESSIONAL_TAX = 200;
export const DEFAULT_ALLOWANCE_RATE = 0.2;
export const DEFAULT_DEDUCTION_RATE = 0.1;

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateTax = (grossPay) => {
  if (grossPay <= 25000) {
    return 0;
  }

  if (grossPay <= 50000) {
    return grossPay * 0.05;
  }

  if (grossPay <= 100000) {
    return grossPay * 0.1;
  }

  return grossPay * 0.15;
};

export const calcPayroll = (
  basicPay,
  otHours = 0,
  otRate = OT_RATE,
  allowanceRate = DEFAULT_ALLOWANCE_RATE,
  deductionRate = DEFAULT_DEDUCTION_RATE
) => {
  const normalizedBasicPay = Number(basicPay) || 0;
  const normalizedOtHours = Number(otHours) || 0;
  const normalizedOtRate = Number(otRate) || OT_RATE;

  const hra = normalizedBasicPay * allowanceRate;
  const overtimePay = normalizedOtHours * normalizedOtRate;
  const grossPay = normalizedBasicPay + hra + overtimePay;
  const taxAmount = calculateTax(grossPay);
  const deductions = normalizedBasicPay * deductionRate + taxAmount + PROFESSIONAL_TAX;
  const netPay = grossPay - deductions;

  return {
    hra: roundCurrency(hra),
    overtimePay: roundCurrency(overtimePay),
    grossPay: roundCurrency(grossPay),
    taxAmount: roundCurrency(taxAmount),
    deductions: roundCurrency(deductions),
    netPay: roundCurrency(netPay),
  };
};
