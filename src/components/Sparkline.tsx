import React from 'react';

export default function Sparkline({ data = [], width = 120, height = 30, stroke = '#ff6200' }: { data?: number[]; width?: number; height?: number; stroke?: string }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const len = data.length;
    const points = data.map((d, i) => {
        const x = (i / (len - 1)) * width;
        const y = max === min ? height / 2 : height - ((d - min) / (max - min)) * height;
        return `${x},${y}`;
    }).join(' ');

    const pathD = data.map((d, i) => {
        const x = (i / (len - 1)) * width;
        const y = max === min ? height / 2 : height - ((d - min) / (max - min)) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
            <polyline points={points} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
