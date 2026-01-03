import { useToastStore } from '@/stores/toastStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export function Toaster() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const backgrounds = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-full max-w-sm px-4">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            flex items-center gap-3 p-4 rounded-xl border shadow-lg
            animate-in slide-in-from-top-2 duration-200
            ${backgrounds[toast.type]}
          `}
                >
                    {icons[toast.type]}
                    <p className="flex-1 text-sm font-medium text-gray-900">
                        {toast.message}
                    </p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
