import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Define accumulation data point interface
export interface AccumulationDataPoint {
  date: number;
  amount: number;
}

// Interface for BTC accumulation chart props
export interface AccumulationChartProps {
  data: AccumulationDataPoint[];
}

// Function to format dates for the chart
const formatXAxis = (tickItem: number, data: AccumulationDataPoint[]): string => {
  // Assuming the API returns data points with most recent at the end
  // Calculate a proper date by working backwards from today
  const totalDays = data.length;
  if (totalDays === 0) return '';
  
  // Calculate the date from the index
  // 180 days is approximately 6 months
  const date = new Date();
  date.setDate(date.getDate() - (totalDays - 1 - tickItem));
  
  // Format as month/day (e.g., "3/15")
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// Function to format Bitcoin amounts
const formatYAxis = (value: number): string => {
  // For small amounts, show more decimal places
  if (value < 0.01) {
    return value.toFixed(4);
  }
  return value.toFixed(2);
};

// Enhanced chart component for BTC accumulation
const AccumulationChart: React.FC<AccumulationChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <div>Loading chart data...</div>;
  
  // Calculate min and max for the y-axis to ensure good scaling
  const minAmount = Math.min(...data.map(d => d.amount));
  const maxAmount = Math.max(...data.map(d => d.amount));
  const yDomain = [
    minAmount > 0 ? minAmount * 0.95 : 0, // 5% lower than min unless min is 0
    maxAmount * 1.05 // 5% higher than max
  ];
  
  // Calculate tick values for the x-axis (start, middle, end)
  const xTicks = [0, Math.floor(data.length / 2), data.length - 1];
  
  return (
    <div className="mt-2" style={{ height: '70px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
        >
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => formatXAxis(value, data)} 
            ticks={xTicks}
            tick={{ fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            domain={yDomain}
            tick={{ fontSize: 10 }}
            width={30}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(8)} BTC`, 'Amount']}
            labelFormatter={(value: number) => {
              return formatXAxis(value, data);
            }}
            contentStyle={{ fontSize: '10px' }}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#f7931a" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccumulationChart;
