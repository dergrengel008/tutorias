import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { DollarSign, CheckCircle, ArrowRight, ArrowDown } from 'lucide-react';

interface PageProps {
    transactions?: any;
    totalEarnings?: number;
    currentBalance?: number;
}

export default function TutorEarnings({ transactions: rawTransactions, totalEarnings = 0, currentBalance = 0 }: PageProps) {
    const transactions = rawTransactions?.data || rawTransactions || [];

    const getTransactionColor = (type: string) => {
        const colors: Record<string, string> = {
            credit: 'text-emerald-600',
            debit: 'text-red-600',
        };
        return colors[type] || 'text-gray-600';
    };

    const getTransactionLabel = (type: string) => {
        const labels: Record<string, string> = {
            credit: 'Crédito',
            debit: 'Débito',
            session_payment: 'Pago de Sesión',
            withdrawal: 'Retiro',
            purchase: 'Compra',
        };
        return labels[type] || type;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const statCards = [
        { label: 'Ganancias Totales', value: totalEarnings, icon: DollarSign, color: 'bg-indigo-50 text-indigo-700' },
        { label: 'Saldo Disponible', value: currentBalance, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="h-7 w-7 text-indigo-500" />
                        Mis Ganancias
                    </h1>
                    <p className="text-gray-500 mt-1">Resumen de tus ingresos por tutorías</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl shadow-lg p-5">
                            <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value} <span className="text-sm text-gray-400">tokens</span></p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Transacciones</h2>
                    {transactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay transacciones registradas.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Fecha</th>
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Descripción</th>
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Tipo</th>
                                        <th className="text-right py-3 px-4 text-gray-500 font-medium">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t: any) => (
                                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-600">{formatDate(t.created_at)}</td>
                                            <td className="py-3 px-4 text-gray-900">{t.description || 'Sesión de tutoría'}</td>
                                            <td className="py-3 px-4 text-gray-500">{getTransactionLabel(t.transaction_type)}</td>
                                            <td className={`py-3 px-4 text-right font-medium ${getTransactionColor(t.transaction_type)}`}>
                                                {Number(t.quantity) >= 0 ? '+' : ''}{t.quantity} tokens
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
