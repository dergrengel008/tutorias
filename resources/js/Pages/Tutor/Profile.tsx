import { useState, useRef } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import {
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    GraduationCap,
    DollarSign,
    Upload,
    Camera,
    Save,
    Award,
    Navigation,
    X,
    BookOpen,
    Lock,
} from 'lucide-react';
import type { TutorProfile, User as UserType, Specialty } from '@/types';

interface PageProps {
    profile: TutorProfile;
    user: UserType;
    specialties: Specialty[];
}

export default function TutorProfileEdit({ profile, user, specialties }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || '',
        professional_title: profile.professional_title || '',
        education_level: profile.education_level || '',
        years_experience: profile.years_experience || 0,
        hourly_rate: profile.hourly_rate || '',
        specialties: profile.specialties?.map((s) => s.id) || [],
        selfie_image: null as File | null,
        id_card_image: null as File | null,
        title_document: null as File | null,
        latitude: user.latitude || '',
        longitude: user.longitude || '',
        _method: 'PUT',
    });

    const [selfiePreview, setSelfiePreview] = useState<string | null>(profile.selfie_image || null);
    const [idCardPreview, setIdCardPreview] = useState<string | null>(profile.id_card_image || null);
    const [titleDocName, setTitleDocName] = useState<string | null>(
        profile.title_document ? profile.title_document.split('/').pop() || null : null
    );
    const [locationLoading, setLocationLoading] = useState(false);

    // Avatar upload state
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarRef = useRef<HTMLInputElement>(null);

    // Change password state
    const [pwData, setPwData] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
    const [pwProcessing, setPwProcessing] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);

    const selfieRef = useRef<HTMLInputElement>(null);
    const idCardRef = useRef<HTMLInputElement>(null);
    const titleDocRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (
        field: 'selfie_image' | 'id_card_image' | 'title_document',
        file: File | null
    ) => {
        if (file) {
            setData(field, file);
            if (field === 'title_document') {
                setTitleDocName(file.name);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (field === 'selfie_image') setSelfiePreview(e.target?.result as string);
                    else setIdCardPreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSpecialtyToggle = (specialtyId: number) => {
        const current = data.specialties;
        if (current.includes(specialtyId)) {
            setData('specialties', current.filter((id) => id !== specialtyId));
        } else {
            setData('specialties', [...current, specialtyId]);
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData('latitude', position.coords.latitude.toString());
                setData('longitude', position.coords.longitude.toString());
                setLocationLoading(false);
            },
            () => {
                alert('No se pudo obtener la ubicación. Verifica los permisos.');
                setLocationLoading(false);
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tutor/profile', {
            forceFormData: true,
            onSuccess: () => {
                // Scroll to top on success
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('La imagen no debe superar 2MB.'); return; }
        setAvatarUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        axios.post('/profile/avatar', formData).then((res) => {
            setAvatarPreview(res.data.avatar_url);
        }).catch((err) => {
            alert(err.response?.data?.message || 'Error al subir la imagen.');
        }).finally(() => setAvatarUploading(false));
    };

    const handleChangePassword = () => {
        setPwErrors({});
        setPwSuccess(false);
        setPwProcessing(true);
        axios.put('/profile/password', pwData).then(() => {
            setPwSuccess(true);
            setPwData({ current_password: '', password: '', password_confirmation: '' });
        }).catch((err) => {
            if (err.response?.data?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([k, v]) => { mapped[k] = String(v); });
                setPwErrors(mapped);
            } else {
                setPwErrors({ current_password: err.response?.data?.message || 'Error al cambiar la contraseña.' });
            }
        }).finally(() => setPwProcessing(false));
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <Award className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">{flash.success}</p>
                    </div>
                )}
                {wasSuccessful && !flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <Award className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">Perfil actualizado correctamente.</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <User className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil de Tutor</h1>
                        <p className="text-gray-500">Completa tu información para recibir estudiantes</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <Camera className="h-5 w-5 text-indigo-500" />
                            Foto de Perfil
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                {avatarPreview ? (
                                    <img src={avatarPreview} className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100" alt="Avatar" />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-200">
                                        <User className="h-10 w-10 text-indigo-500" />
                                    </div>
                                )}
                                <button type="button" onClick={() => avatarRef.current?.click()}
                                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-6 w-6 text-white" />
                                </button>
                                <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Tu foto de perfil</p>
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP. Máximo 2MB.</p>
                                <p className="text-xs text-gray-500">Se mostrará en tu perfil público y en las sesiones.</p>
                                {avatarUploading && <p className="text-xs text-indigo-600 mt-2 font-medium">Subiendo...</p>}
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <Lock className="h-5 w-5 text-indigo-500" />
                            Cambiar Contraseña
                        </h2>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña Actual</label>
                                <input type="password" value={pwData.current_password} onChange={(e) => setPwData({...pwData, current_password: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="••••••••" />
                                {pwErrors.current_password && <p className="text-red-500 text-xs mt-1">{pwErrors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva Contraseña</label>
                                <input type="password" value={pwData.password} onChange={(e) => setPwData({...pwData, password: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Mínimo 8 caracteres" />
                                {pwErrors.password && <p className="text-red-500 text-xs mt-1">{pwErrors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Nueva Contraseña</label>
                                <input type="password" value={pwData.password_confirmation} onChange={(e) => setPwData({...pwData, password_confirmation: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Repite la contraseña" />
                                {pwErrors.password_confirmation && <p className="text-red-500 text-xs mt-1">{pwErrors.password_confirmation}</p>}
                            </div>
                            <button type="button" onClick={handleChangePassword} disabled={pwProcessing}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
                                <Lock className="h-4 w-4" />
                                {pwProcessing ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                            {pwSuccess && <p className="text-emerald-600 text-sm font-medium">Contraseña actualizada correctamente.</p>}
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <User className="h-5 w-5 text-indigo-500" />
                            Información Personal
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Tu nombre completo"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Mail className="h-4 w-4 inline mr-1" />
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">El correo no se puede modificar</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Phone className="h-4 w-4 inline mr-1" />
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="+1 234 567 8900"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Calle, número, apartamento"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    Ciudad
                                </label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Ej: Santo Domingo"
                                />
                                {errors.city && (
                                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    País
                                </label>
                                <input
                                    type="text"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Ej: República Dominicana"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Biografía
                                </label>
                                <textarea
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                    placeholder="Cuéntanos sobre ti, tu experiencia y tu pasión por enseñar..."
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {data.bio?.length || 0}/500 caracteres
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <GraduationCap className="h-5 w-5 text-indigo-500" />
                            Información Profesional
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Título Profesional
                                </label>
                                <input
                                    type="text"
                                    value={data.professional_title}
                                    onChange={(e) => setData('professional_title', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Ej: Licenciado en Matemáticas, Ing. de Sistemas"
                                />
                                {errors.professional_title && (
                                    <p className="text-red-500 text-xs mt-1">{errors.professional_title}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <BookOpen className="h-4 w-4 inline mr-1" />
                                    Nivel de Educación
                                </label>
                                <select
                                    value={data.education_level}
                                    onChange={(e) => setData('education_level', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="bachillerato">Bachillerato</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="licenciatura">Licenciatura</option>
                                    <option value="ingenieria">Ingeniería</option>
                                    <option value="maestria">Maestría</option>
                                    <option value="doctorado">Doctorado</option>
                                    <option value="otro">Otro</option>
                                </select>
                                {errors.education_level && (
                                    <p className="text-red-500 text-xs mt-1">{errors.education_level}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Años de Experiencia
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.years_experience}
                                    onChange={(e) =>
                                        setData('years_experience', parseInt(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <DollarSign className="h-4 w-4 inline mr-1" />
                                    Tarifa por Hora (Tokens)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.hourly_rate}
                                    onChange={(e) => setData('hourly_rate', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Ej: 5"
                                />
                                {errors.hourly_rate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.hourly_rate}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Specialties */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <Award className="h-5 w-5 text-indigo-500" />
                            Especialidades
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Selecciona las áreas en las que puedes impartir tutorías
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {specialties.map((specialty) => (
                                <label
                                    key={specialty.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                        data.specialties.includes(specialty.id)
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.specialties.includes(specialty.id)}
                                        onChange={() => handleSpecialtyToggle(specialty.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{specialty.name}</p>
                                        {specialty.description && (
                                            <p className="text-xs text-gray-500">{specialty.description}</p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.specialties && (
                            <p className="text-red-500 text-xs mt-2">{errors.specialties}</p>
                        )}
                    </div>

                    {/* Document Upload */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <Upload className="h-5 w-5 text-indigo-500" />
                            Documentos de Verificación
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Selfie */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Camera className="h-4 w-4 inline mr-1" />
                                    Foto de Identificación (Selfie)
                                </label>
                                <div
                                    onClick={() => selfieRef.current?.click()}
                                    className="relative h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer transition-colors flex flex-col items-center justify-center overflow-hidden bg-gray-50 hover:bg-indigo-50"
                                >
                                    {selfiePreview ? (
                                        <>
                                            <img
                                                src={selfiePreview}
                                                alt="Selfie preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelfiePreview(null);
                                                        setData('selfie_image', null);
                                                    }}
                                                    className="h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Haz clic para subir</p>
                                            <p className="text-xs text-gray-400">JPG, PNG</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={selfieRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileChange('selfie_image', e.target.files?.[0] || null)
                                    }
                                />
                                {errors.selfie_image && (
                                    <p className="text-red-500 text-xs mt-1">{errors.selfie_image}</p>
                                )}
                            </div>

                            {/* ID Card */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="h-4 w-4 inline mr-1" />
                                    Cédula / Documento de Identidad
                                </label>
                                <div
                                    onClick={() => idCardRef.current?.click()}
                                    className="relative h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer transition-colors flex flex-col items-center justify-center overflow-hidden bg-gray-50 hover:bg-indigo-50"
                                >
                                    {idCardPreview ? (
                                        <>
                                            <img
                                                src={idCardPreview}
                                                alt="ID card preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIdCardPreview(null);
                                                        setData('id_card_image', null);
                                                    }}
                                                    className="h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Haz clic para subir</p>
                                            <p className="text-xs text-gray-400">JPG, PNG</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={idCardRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileChange('id_card_image', e.target.files?.[0] || null)
                                    }
                                />
                                {errors.id_card_image && (
                                    <p className="text-red-500 text-xs mt-1">{errors.id_card_image}</p>
                                )}
                            </div>

                            {/* Title Document */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="h-4 w-4 inline mr-1" />
                                    Documento de Título Profesional
                                </label>
                                <div
                                    onClick={() => titleDocRef.current?.click()}
                                    className="relative h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer transition-colors flex flex-col items-center justify-center overflow-hidden bg-gray-50 hover:bg-indigo-50"
                                >
                                    {titleDocName ? (
                                        <div className="text-center p-4">
                                            <FileText className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-700 break-all">
                                                {titleDocName}
                                            </p>
                                            <p className="text-xs text-gray-400">PDF</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTitleDocName(null);
                                                    setData('title_document', null);
                                                }}
                                                className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Haz clic para subir</p>
                                            <p className="text-xs text-gray-400">PDF</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={titleDocRef}
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileChange('title_document', e.target.files?.[0] || null)
                                    }
                                />
                                {errors.title_document && (
                                    <p className="text-red-500 text-xs mt-1">{errors.title_document}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <MapPin className="h-5 w-5 text-indigo-500" />
                            Ubicación
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Latitud
                                </label>
                                <input
                                    type="text"
                                    value={data.latitude}
                                    onChange={(e) => setData('latitude', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Ej: 18.4861"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Longitud
                                </label>
                                <input
                                    type="text"
                                    value={data.longitude}
                                    onChange={(e) => setData('longitude', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Ej: -69.9312"
                                    readOnly
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={locationLoading}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Navigation className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`} />
                                    {locationLoading ? 'Obteniendo ubicación...' : 'Obtener Ubicación'}
                                </button>
                            </div>
                        </div>
                        {/* Map Placeholder */}
                        <div className="mt-6 h-48 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <MapPin className="h-10 w-10 mb-2" />
                            <p className="font-medium">Mapa de Ubicación</p>
                            <p className="text-xs mt-1">
                                La integración con Google Maps API estará disponible próximamente
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 py-3 font-semibold text-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-5 w-5" />
                            {processing ? 'Guardando...' : 'Guardar Perfil'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
