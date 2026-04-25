import { useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Plus,
    Edit,
    Trash,
    Coins,
    X,
    Save,
    CheckCircle,
    XCircle,
    Star,
    DollarSign,
    Eye,
    EyeOff,
    GripVertical,
} from 'lucide-react';
import type { TokenPackage } from '@/types';

interface PageProps {
    packages: TokenPackage[];
}

export default function ManageTokenPackages({ packages: initialPackages }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const packages = (props.packages || initialPackages) as TokenPackage[];

    const [showForm, setShowForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        tokens: 50,
        bonus_tokens: 0,
        price_usd: 5,
        price_ves: '',
        is_popular: false,
        is_active: true,
        sort_order: 0,
    });

    const openCreateForm = () => {
        setEditingPackage(null);
        setData('name', '');
        setData('tokens', 50);
        setData('bonus_tokens', 0);
        setData('price_usd', 5);
        setData('price_ves', '');
        setData('is_popular', false);
        setData('is_active', true);
        setData('sort_order', packages.length);
        setShowForm(true);
    };

    const openEditForm = (pkg: TokenPackage) => {
        setEditingPackage(pkg);
        setData('name', pkg.name);
        setData('tokens', pkg.tokens);
        setData('bonus_tokens', pkg.bonus_tokens);
        setData('price_usd', Number(pkg.price_usd));
        setData('price_ves', pkg.price_ves ? String(pkg.price_ves) : '');
        setData('is_popular', pkg.is_popular);
        setData('is_active', pkg.is_active);
        setData('sort_order', pkg.sort_order);
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            price_ves: data.price_ves ? Number(data.price_ves) : null,
        };
        if (editingPackage) {
            put(`/admin/token-packages/${editingPackage.id}`, {
                data: payload,
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                    setEditingPackage(null);
                },
            });
        } else {
            post('/admin/token-packages', {
                data: payload,
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (packageId: number) => {
        if (confirm('¿Estás seguro de eliminar este paquete?')) {
            router.delete(`/admin/token-packages/${packageId}`);
        }
    };

    const toggleActive = (pkg: TokenPackage) => {
        router.put(`/admin/token-packages/${pkg.id}`, {
            data: {
                name: pkg.name,
                tokens: pkg.tokens,
                bonus_tokens: pkg.bonus_tokens,
                price_usd: pkg.price_usd,
                price_ves: pkg.price_ves || null,
                is_popular: pkg.is_popular,
                is_active: !pkg.is_active,
                sort_order: pkg.sort_order,
            },
        }, { preserveScroll: true });
    };

    const togglePopular = (pkg: TokenPackage) => {
        router.put(`/admin/token-packages/${pkg.id}`, {
            data: {
                name: pkg.name,
                tokens: pkg.tokens,
                bonus_tokens: pkg.bonus_tokens,
                price_usd: pkg.price_usd,
                price_ves: pkg.price_ves || null,
                is_popular: !pkg.is_popular,
                is_active: pkg.is_active,
                sort_order: pkg.sort_order,
            },
        }, { preserveScroll: true });
    };

    const totalTokens = (tokens: number, bonus: number) => tokens + bonus;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">{flash.error}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Coins className="h-7 w-7 text-amber-500" />
                            Paquetes de Tokens
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Define los paquetes de compra que ven los estudiantes
                        </p>
                    </div>
                    <button
                        onClick={openCreateForm}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Paquete
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingPackage ? 'Editar Paquete' : 'Nuevo Paquete'}
                                </h2>
                                <button
                                    onClick={() => { setShowForm(false); setEditingPackage(null); reset(); }}
                                    className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="Ej: Básico, Popular, Premium"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tokens *</label>
                                        <div className="relative">
                                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={data.tokens}
                                                onChange={(e) => setData('tokens', Number(e.target.value))}
                                                min={1}
                                                className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                        {errors.tokens && <p className="text-red-500 text-xs mt-1">{errors.tokens}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tokens de regalo</label>
                                        <div className="relative">
                                            <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                                            <input
                                                type="number"
                                                value={data.bonus_tokens}
                                                onChange={(e) => setData('bonus_tokens', Number(e.target.value))}
                                                min={0}
                                                className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                        {errors.bonus_tokens && <p className="text-red-500 text-xs mt-1">{errors.bonus_tokens}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio USD *</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                            <input
                                                type="number"
                                                value={data.price_usd}
                                                onChange={(e) => setData('price_usd', Number(e.target.value))}
                                                min={0}
                                                step="0.01"
                                                className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                        {errors.price_usd && <p className="text-red-500 text-xs mt-1">{errors.price_usd}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio VES</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-500">Bs</span>
                                            <input
                                                type="number"
                                                value={data.price_ves}
                                                onChange={(e) => setData('price_ves', e.target.value)}
                                                min={0}
                                                step="0.01"
                                                className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                placeholder="Opcional"
                                            />
                                        </div>
                                        {errors.price_ves && <p className="text-red-500 text-xs mt-1">{errors.price_ves}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
                                        <div className="relative">
                                            <GripVertical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', Number(e.target.value))}
                                                min={0}
                                                className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_popular}
                                                onChange={(e) => setData('is_popular', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                                            <span className="ml-2 text-sm font-medium text-gray-700">Destacado</span>
                                        </label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                                            <span className="ml-2 text-sm font-medium text-gray-700">Activo</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setEditingPackage(null); reset(); }}
                                        className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Guardando...' : editingPackage ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Packages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                                pkg.is_popular ? 'ring-2 ring-amber-400' : ''
                            } ${pkg.is_active === false ? 'opacity-60' : ''}`}
                        >
                            {pkg.is_popular && (
                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-center">
                                    <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                                        <Star className="h-3 w-3" /> MAS POPULAR
                                    </span>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Coins className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditForm(pkg)}
                                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center text-gray-500 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleActive(pkg)}
                                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                                                pkg.is_active === false
                                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                            title={pkg.is_active === false ? 'Activar' : 'Desactivar'}
                                        >
                                            {pkg.is_active === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => togglePopular(pkg)}
                                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                                                pkg.is_popular
                                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                            title={pkg.is_popular ? 'Quitar destacado' : 'Destacar'}
                                        >
                                            <Star className={`h-4 w-4 ${pkg.is_popular ? 'fill-amber-500' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pkg.id)}
                                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-500 transition-colors"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Tokens</span>
                                        <span className="text-sm font-semibold text-gray-900">{pkg.tokens}</span>
                                    </div>
                                    {pkg.bonus_tokens > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Bonus</span>
                                            <span className="text-sm font-semibold text-amber-600">+{pkg.bonus_tokens}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-sm text-gray-500">Total</span>
                                        <span className="text-base font-bold text-indigo-600">
                                            {totalTokens(pkg.tokens, pkg.bonus_tokens)} tokens
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <DollarSign className="h-4 w-4 text-green-500" />
                                        <span className="font-semibold text-gray-900">${Number(pkg.price_usd).toFixed(2)}</span>
                                    </div>
                                    {pkg.price_ves && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <span className="font-bold text-blue-500">Bs</span>
                                            {Number(pkg.price_ves).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {pkg.is_active === false && !pkg.is_popular && (
                                <div className="bg-amber-50 px-4 py-1.5 text-center">
                                    <span className="text-xs font-medium text-amber-700">Inactivo</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {packages.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Coins className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay paquetes de tokens
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Crea el primer paquete para que los estudiantes puedan comprar tokens
                        </p>
                        <button
                            onClick={openCreateForm}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Crear Paquete
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
