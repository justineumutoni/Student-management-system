'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SubjectBarChartProps {
  data: {
    subject: string;
    percentage: number;
    attended: number;
    total: number;
  }[];
}

export const SubjectBarChart: React.FC<SubjectBarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            stroke="#64748b" 
            fontSize={12}
            unit="%"
          />
          <YAxis 
            dataKey="subject" 
            type="category" 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            width={100}
          />
          <Tooltip
            formatter={(value: any, name: any, item: any) => [
              `${value}% (${item.payload.attended}/${item.payload.total} classes)`,
              'Attendance'
            ]}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => {
              const color = 
                entry.percentage >= 85 ? '#10b981' : 
                entry.percentage >= 75 ? '#6366f1' : 
                '#f43f5e';
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
