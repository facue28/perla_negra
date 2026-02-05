import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminCouponForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);

    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percent', // DB expects 'percent', not 'percentage'
        discount_value: '',
        expiration_date: '',
        usage_limit: '',
        min_purchase_amount: ''
    });

    useEffect(() => {
        if (isEditing) {
            fetchCoupon();
        }
    }, [id]);

    const fetchCoupon = async () => {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Format date for input: YYYY-MM-DD
            let formattedDate = '';
            // Handle expiration_date OR expires_at
            const dbDate = data.expiration_date || data.expires_at;
            if (dbDate) {
                formattedDate = new Date(dbDate).toISOString().split('T')[0];
            }

            setFormData({
                code: data.code,
                discount_type: data.discount_type, // Now using 'percent' consistently
                discount_value: data.discount_value ?? data.value,
                expiration_date: formattedDate,
                usage_limit: data.usage_limit || '',
                min_purchase_amount: data.min_purchase_amount || ''
            });

        } catch (error) {
            console.error('Error fetching coupon:', error);
            toast.error('Error al cargar datos del cupón');
            navigate('/admin/coupons');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'code') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s/g, '') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const couponData = {
            code: formData.code,
            discount_type: formData.discount_type,
            value: parseFloat(formData.discount_value), // DB column is 'value'
            expires_at: formData.expiration_date || null, // DB column is 'expires_at'
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : 0,
            active: true // DB column is 'active'
        };

        try {
            let error;

            if (isEditing) {
                // Update
                const { error: updateError } = await supabase
                    .from('coupons')
                    .update(couponData)
                    .eq('id', id);
                error = updateError;
            } else {
                // Create
                const { error: insertError } = await supabase
                    .from('coupons')
                    .insert([couponData]);
                error = insertError;
            }

            if (error) throw error;

            toast.success(`Cupón ${isEditing ? 'actualizado' : 'creado'} exitosamente`);
            navigate('/admin/coupons');

        } catch (error) {
            console.error('Error saving coupon:', error);
            if (error.code === '23505') { // Unique violation
                toast.error('Error: El código de cupón ya existe');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-accent" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/coupons')}
                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-white">{isEditing ? 'Editar Cupón' : 'Nuevo Cupón'}</h1>
                    <p className="text-text-muted">{isEditing ? 'Modifica los detalles del cupón' : 'Crea un código promocional para tus clientes'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">

                    {/* Code */}
                    <div className="space-y-2">
                        <label className="text-sm text-text-muted">Código del Cupón *</label>
                        <input
                            required
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50 font-mono tracking-wider uppercase text-lg"
                            placeholder="EJ: VERANO2025"
                        />
                        <p className="text-xs text-text-muted">Se convertirá automáticamente a mayúsculas y sin espacios.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Tipo de Descuento</label>
                            <select
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white [&>option]:bg-zinc-900"
                            >
                                <option value="percent">Porcentaje (%)</option>
                                <option value="fixed">Monto Fijo ($)</option>
                            </select>
                        </div>

                        {/* Value */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Valor *</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step={formData.discount_type === 'percent' ? '1' : '0.01'}
                                max={formData.discount_type === 'percent' ? '100' : undefined}
                                name="discount_value"
                                value={formData.discount_value}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white"
                                placeholder={formData.discount_type === 'percent' ? '15' : '500.00'}
                            />
                        </div>
                    </div>

                    {/* Expiration */}
                    <div className="space-y-2">
                        <label className="text-sm text-text-muted">Fecha de Expiración (Opcional)</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="date"
                                name="expiration_date"
                                value={formData.expiration_date}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Usage Limit */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Límite de Usos (Opcional)</label>
                            <input
                                type="number"
                                min="1"
                                name="usage_limit"
                                value={formData.usage_limit}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white"
                                placeholder="Ej: 100"
                            />
                            <p className="text-xs text-text-muted">Dejar vacío para uso ilimitado.</p>
                        </div>

                        {/* Min Purchase */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Mínimo de Compra ($)</label>
                            <input
                                type="number"
                                min="0"
                                name="min_purchase_amount"
                                value={formData.min_purchase_amount}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/coupons')}
                        className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-xl bg-accent text-background-dark font-bold hover:bg-accent-light transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Save size={20} />
                                {isEditing ? 'Actualizar Cupón' : 'Crear Cupón'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminCouponForm;
