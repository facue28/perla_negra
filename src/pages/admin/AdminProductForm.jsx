import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, Upload, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        subtitle: '',
        description: '',
        description_additional: '', // Internal name mapping for DB
        price: '',
        category: '', // e.g. 'Lubricantes', 'Juguetes', 'Lenceria'
        stock: '',
        image: '',
        brand: '',
        code: '',
        size: '', // e.g. "100ml" or "M/L"
        usage: '',
        ingredients: '',
        tips: '',
        sensation: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Categories hardcoded for now, could be dynamic later
    const CATEGORIES = ['Lubricantes', 'Juguetes', 'Lenceria', 'Aceites', 'Fragancias', 'Vigorizzanti', 'Olio commestibile', 'Gioco', 'Kits'];

    const convertToWebP = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Create a new file with .webp extension
                            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                type: 'image/webp'
                            });
                            resolve(newFile);
                        } else {
                            reject(new Error('Conversion failed'));
                        }
                    }, 'image/webp', 0.85); // 0.85 quality is a good balance
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    useEffect(() => {
        if (isEditing) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setFormData({
                name: data.name || '',
                subtitle: data.subtitle || '',
                description: data.description || '',
                description_additional: data.description_additional || '', // Map DB field
                price: data.price || '',
                category: data.category || '',
                stock: data.stock || 0,
                image: data.image || '',
                brand: data.brand || '',
                code: data.code || '',
                size: data.size || '', // Assuming 'size' column exists, check schema later if needed
                usage: data.usage || '',
                ingredients: data.ingredients || '',
                tips: data.tips || '',
                sensation: data.sensation || ''
            });
            setImagePreview(data.image);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Error al cargar el producto');
            navigate('/admin/products');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Show preview immediately
            setImagePreview(URL.createObjectURL(file));

            // Convert to WebP in background
            const webpFile = await convertToWebP(file);
            console.log(`Converted ${file.name} (${(file.size / 1024).toFixed(2)}KB) to ${webpFile.name} (${(webpFile.size / 1024).toFixed(2)}KB)`);
            setImageFile(webpFile);

            toast.success('Imagen optimizada automáticamente a WebP ✨');
        } catch (error) {
            console.error('Error converting image:', error);
            toast.error('No se pudo optimizar la imagen, se usará la original');
            setImageFile(file); // Fallback to original
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.image;

        const fileName = `${Math.random().toString(36).substring(2)}.webp`; // Always .webp
        const filePath = `${fileName}`;

        try {
            setUploading(true);
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Falló la subida de imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Image if changed
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

            // 2. Prepare Data
            const productData = {
                ...formData,
                image: imageUrl,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                // Generate slug from name if new
                ...(!isEditing && { slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') })
            };

            // 3. Save to DB
            if (isEditing) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', id);
                if (error) throw error;
                toast.success('Producto actualizado exitosamente');
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                if (error) throw error;
                toast.success('Producto creado exitosamente');
            }

            navigate('/admin/products');

        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-accent" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-white">
                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                    </h1>
                    <p className="text-text-muted">
                        {isEditing ? `Editando: ${formData.name}` : 'Agrega un nuevo producto al catálogo'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Info Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
                    <h2 className="text-xl font-medium text-white border-b border-white/10 pb-4">Información Principal</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Nombre del Producto *</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                placeholder="Ej: Aceite de Masaje"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Categoría *</label>
                            <select
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white [&>option]:bg-zinc-900"
                            >
                                <option value="">Seleccionar...</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subtitle */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm text-text-muted">Subtítulo (Corto)</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                placeholder="Ej: Relajante y aromático"
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Precio ($) *</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Stock Disponible *</label>
                            <input
                                required
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Details & Image */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
                            <h2 className="text-xl font-medium text-white border-b border-white/10 pb-4">Detalles</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Brand */}
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted">Marca</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white"
                                    />
                                </div>
                                {/* Code/SKU */}
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted">Código (SKU)</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white"
                                    />
                                </div>
                                {/* Size */}
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted">Tamaño</label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white"
                                        placeholder="Ej: 100ml / M"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm text-text-muted">Descripción Principal *</label>
                                <textarea
                                    required
                                    rows={4}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                />
                            </div>

                            {/* Additional Description */}
                            <div className="space-y-2">
                                <label className="text-sm text-text-muted">Descripción Adicional (Extendido)</label>
                                <textarea
                                    rows={6}
                                    name="description_additional"
                                    value={formData.description_additional}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                />
                            </div>
                        </div>

                        {/* Extra Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
                            <h2 className="text-xl font-medium text-white border-b border-white/10 pb-4">Información Extra</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <input name="usage" value={formData.usage} onChange={handleChange} placeholder="Modo de Uso" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                                <input name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="Ingredientes" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                                <input name="tips" value={formData.tips} onChange={handleChange} placeholder="Tips" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                                <input name="sensation" value={formData.sensation} onChange={handleChange} placeholder="Sensación" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                            <h2 className="text-xl font-medium text-white mb-4">Imagen del Producto</h2>

                            <div className="flex flex-col items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden group">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Upload className="text-white" />
                                                <span className="ml-2 text-white font-medium">Cambiar</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-text-muted">
                                            <ImageIcon className="w-10 h-10 mb-3" />
                                            <p className="mb-2 text-sm"><span className="font-semibold">Click para subir</span></p>
                                            <p className="text-xs">PNG, JPG (MAX. 5MB)</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 py-3 px-4 rounded-xl bg-accent text-background-dark font-bold hover:bg-accent-light transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                            >
                                {loading || uploading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Guardar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;
