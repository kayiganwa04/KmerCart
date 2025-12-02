import React, { useEffect } from 'react';

export default function Toast({ message = '', onClose }: { message?: string; onClose?: () => void }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => onClose && onClose(), 3500);
        return () => clearTimeout(t);
    }, [message, onClose]);

    if (!message) return null;
    return (
        <div aria-live="polite" className="fixed bottom-6 right-6 bg-white border border-gray-200 px-4 py-2 rounded shadow">
            <div className="text-sm text-gray-800">{message}</div>
        </div>
    );
}
