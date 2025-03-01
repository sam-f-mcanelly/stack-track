export const formatValue = (value: number, unit: string) => {
    if (unit.trim().toUpperCase() == "USD") {
      return `$${value.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    } else if (unit.trim().toUpperCase() == "BTC") {
      return `₿${value.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 8 
      })}`;
    } else {
      // For other units, use generic formatting
      return `${value.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 8 
      })} ${unit}`;
    }
  };