import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, Upload, Image as ImageIcon, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Product } from '@/features/products/types';

interface FormData {
    name: string;
    subtitle: string;
    description: string;
    description_additional: string;
    price: string | number;
    category: string;
    stock: string | number;
    image_url: string; // Changed from image to image_url to match DB
    image2_url: string;
    image3_url: string;
    brand: string;
    code: string;
    size: string;
    size_ml: string | number;
    size_fl_oz: string | number;
    usage: string;
    ingredients: string;
    tips: string;
    sensation: string;
}

const AdminProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(isEditing);
    const [uploading, setUploading] = useState<boolean>(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        subtitle: '',
        description: '',
        description_additional: '',
        price: '',
        category: '',
        stock: 0,
        image_url: '',
        image2_url: '',
        image3_url: '',
        brand: '',
        code: '',
        size: '',
        size_ml: '',
        size_fl_oz: '',
        usage: '',
        ingredients: '',
        tips: '',
        sensation: ''
    });

    const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
    const [thumbFiles, setThumbFiles] = useState<(File | null)[]>([null, null, null]);
    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);

    const CATEGORIES = ['Lubrificanti', 'Lubrificante', 'Fragranza', 'Vigorizzanti', 'Olio commestibile', 'Gioco'];

    const convertToWebP = (file: File, targetWidth?: number): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (targetWidth && width > targetWidth) {
                        height = (targetWidth / width) * height;
                        width = targetWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const suffix = targetWidth ? "-min" : "";
                            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + suffix + ".webp", {
                                type: 'image/webp'
                            });
                            resolve(newFile);
                        } else {
                            reject(new Error('Conversion failed'));
                        }
                    }, 'image/webp', 0.85);
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

    const fetchProduct = async (): Promise<void> => {
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
                description_additional: data.description_additional || data.details || '',
                price: data.price || '',
                category: data.category || '',
                stock: data.stock || 0,
                image_url: data.image_url || '', // Changed from image to image_url
                image2_url: data.image2_url || '',
                image3_url: data.image3_url || '',
                brand: data.brand || '',
                code: data.code || '',
                size: data.size || '',
                size_ml: data.size_ml || '',
                size_fl_oz: data.size_fl_oz || '',
                usage: data.usage || '',
                ingredients: data.ingredients || '',
                tips: data.tips || '',
                sensation: data.sensation || ''
            });
            setImagePreviews([data.image_url || null, data.image2_url || null, data.image3_url || null]);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Errore durante il caricamento del prodotto');
            navigate('/admin/products');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-calculate size string if ml or oz changes
            if (name === 'size_ml' || name === 'size_fl_oz') {
                const ml = name === 'size_ml' ? value : prev.size_ml;
                const oz = name === 'size_fl_oz' ? value : prev.size_fl_oz;

                let sizeText = '';
                if (ml && oz) {
                    sizeText = `${ml} ml / ${oz} fl oz`;
                } else if (ml) {
                    sizeText = `${ml} ml`;
                } else if (oz) {
                    sizeText = `${oz} fl oz`;
                }

                // Only update size if we have components, otherwise leave it (or empty it if both removed)
                if (ml || oz) {
                    newData.size = sizeText;
                } else if (name === 'size_ml' || name === 'size_fl_oz') {
                    // If both cleared, clear size text only if it looks like an auto-generated one
                    // Simple heuristic: clear it if empty
                    newData.size = '';
                }
            }
            return newData;
        });
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const newPreviews = [...imagePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setImagePreviews(newPreviews);

            const webpFile = await convertToWebP(file, 1200);
            const thumbFile = await convertToWebP(file, 400);

            const newFiles = [...imageFiles];
            newFiles[index] = webpFile;
            setImageFiles(newFiles);

            const newThumbs = [...thumbFiles];
            newThumbs[index] = thumbFile;
            setThumbFiles(newThumbs);

            toast.success(`Immagine ${index + 1} e miniatura ottimizzate ✨`);
        } catch (error) {
            console.error('Error converting image:', error);
            toast.error('Impossibile ottimizzare l\'immagine, verrà usata l\'originale');
            const newFiles = [...imageFiles];
            newFiles[index] = file;
            setImageFiles(newFiles);
        }
    };

    const uploadImage = async (file: File, slug: string, index: number, isThumb: boolean = false): Promise<string> => {
        const suffix = index === 0 ? '' : `-${index + 1}`;
        const minSuffix = isThumb ? '-min' : '';
        const fileName = `${slug}${suffix}${minSuffix}.webp`;
        const filePath = `${fileName}`;

        try {
            setUploading(true);
            const { error: uploadError } = await supabase.storage
                .from('images') // Correct bucket
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error(`Caricamento dell'immagine ${index + 1} fallito`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = isEditing && (formData as any).slug
                ? (formData as any).slug
                : formData.name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            const imageUrls = [formData.image_url, formData.image2_url, formData.image3_url];

            // Subir las nuevas imágenes
            for (let i = 0; i < imageFiles.length; i++) {
                if (imageFiles[i]) {
                    imageUrls[i] = await uploadImage(imageFiles[i]!, slug, i);

                    // Subir también la miniatura
                    if (thumbFiles[i]) {
                        await uploadImage(thumbFiles[i]!, slug, i, true);
                    }
                }
            }

            const productData = {
                ...formData,
                image_url: imageUrls[0], // Explicitly correct column name
                image2_url: imageUrls[1],
                image3_url: imageUrls[2],
                price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
                stock: typeof formData.stock === 'string' ? parseInt(formData.stock) : formData.stock,
                size_ml: formData.size_ml === '' ? null : (typeof formData.size_ml === 'string' ? parseFloat(formData.size_ml) : formData.size_ml),
                size_fl_oz: formData.size_fl_oz === '' ? null : (typeof formData.size_fl_oz === 'string' ? parseFloat(formData.size_fl_oz) : formData.size_fl_oz),
                slug: slug
            };

            if (isEditing && id) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', id);
                if (error) throw error;
                toast.success('Prodotto aggiornato con successo');
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                if (error) throw error;
                toast.success('Prodotto creato con successo');
            }

            navigate('/admin/products');

        } catch (error: any) {
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
        <div className="max-w-5xl mx-auto pb-12">
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
                        {isEditing ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
                    </h1>
                    <p className="text-text-muted">
                        {isEditing ? `Modifica: ${formData.name}` : 'Aggiungi un nuovo prodotto al catalogo'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Info Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
                    <h2 className="text-xl font-medium text-white border-b border-white/10 pb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-accent" />
                        Informazioni Essenziali
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Nome del Prodotto *</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                placeholder="Es: Olio da Massaggio"
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
                                <option value="">Seleziona...</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                {/* Fallback: if DB value doesn't match any listed category, show it anyway */}
                                {formData.category && !CATEGORIES.includes(formData.category) && (
                                    <option value={formData.category}>{formData.category}</option>
                                )}
                            </select>
                        </div>

                        {/* Subtitle */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm text-text-muted">Sottotitolo *</label>
                            <input
                                required
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                placeholder="Es: Rilassante e aromatico"
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Prezzo (€) *</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Stock Disponibile (Consigliato)</label>
                            <input
                                type="number"
                                min="0"
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
                            <h2 className="text-xl font-medium text-white border-b border-white/10 pb-4">Dettagli Tecnici</h2>

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
                                    <label className="text-sm text-text-muted">Codice (SKU)</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white"
                                    />
                                </div>

                                {/* Size Inputs Group */}
                                <div className="space-y-4 md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <label className="text-sm text-text-muted font-medium block mb-2">Dimensione / Capacità</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Size ML */}
                                        <div className="space-y-2">
                                            <label className="text-xs text-text-muted">Millilitri (ml)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="size_ml"
                                                value={formData.size_ml}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
                                                placeholder="Es: 100"
                                            />
                                        </div>

                                        {/* Size fl oz */}
                                        <div className="space-y-2">
                                            <label className="text-xs text-text-muted">Once (fl oz)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="size_fl_oz"
                                                value={formData.size_fl_oz}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
                                                placeholder="Es: 3.4"
                                            />
                                        </div>
                                    </div>
                                    {/* Formato personalizzato (override manuale) */}
                                    <div className="space-y-1 mt-3 border-t border-white/10 pt-3">
                                        <label className="text-xs text-text-muted flex items-center gap-1">
                                            Formato visualizzato sul sito
                                            <span className="text-white/30 italic">(auto-generato, modificabile)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="size"
                                            value={formData.size}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-black/30 border border-accent/30 rounded-lg focus:outline-none focus:border-accent text-accent font-mono text-sm"
                                            placeholder="Es: 100 ml / 30 CAPS / 1 bustina"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm text-text-muted">Descrizione Breve *</label>
                                <textarea
                                    required
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                />
                            </div>

                            {/* Additional Description */}
                            <div className="space-y-2">
                                <label className="text-sm text-text-muted">Descrizione Completa</label>
                                <textarea
                                    rows={8}
                                    name="description_additional"
                                    value={formData.description_additional}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-text-muted/50"
                                />
                            </div>
                        </div>

                        {/* Extra Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
                            <h2 className="text-xl font-medium text-white border-b border-white/10 pb-4">Informazioni Extra</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted">Modo d'Uso</label>
                                    <textarea name="usage" rows={2} value={formData.usage} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted">Ingredienti</label>
                                    <textarea name="ingredients" rows={2} value={formData.ingredients} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted">Suggerimenti / Consigli</label>
                                    <textarea name="tips" rows={2} value={formData.tips} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted">Sensazione</label>
                                    <input name="sensation" value={formData.sensation} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                            <h2 className="text-xl font-medium text-white mb-4">Immagini del Prodotto</h2>
                            <p className="text-xs text-text-muted mb-6">
                                Le immagini verranno convertite in WebP e rinominate automaticamente.
                            </p>

                            <div className="space-y-6">
                                {[0, 1, 2].map((idx) => (
                                    <div key={idx} className="space-y-2">
                                        <label className="text-xs text-text-muted uppercase font-bold tracking-wider ml-1">
                                            {idx === 0 ? 'Immagine Principale *' : `Immagine Aggiuntiva ${idx + 1}`}
                                        </label>
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden group">
                                                {imagePreviews[idx] ? (
                                                    <>
                                                        <img src={imagePreviews[idx]!} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain p-2" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <Upload className="text-white" />
                                                            <span className="ml-2 text-white font-medium">Cambia</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-text-muted text-center">
                                                        <ImageIcon className="w-8 h-8 mb-2" />
                                                        <p className="text-xs">Carica immagine {idx + 1}</p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(e, idx)}
                                                    required={idx === 0 && !isEditing} // Required only for main image on create
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Annulla
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
                                        Salva
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

