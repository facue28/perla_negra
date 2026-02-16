import { useEffect } from 'react';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AbandonedCartToast = () => {
    const { items } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if toast has already been shown in this session
        const hasShownToast = sessionStorage.getItem('abandonedCartToastShown');

        // Check if there are items in the cart and we haven't shown the toast yet
        if (items.length > 0 && !hasShownToast) {
            // Delay slightly to let the page load
            const timer = setTimeout(() => {
                toast("Hai ancora dei prodotti nel carrello!", {
                    description: "Vuoi completare l'ordine prima che finiscano?",
                    action: {
                        label: "Vai al Checkout",
                        onClick: () => navigate('/carrello')
                    },
                    duration: 8000, // Show for 8 seconds
                });

                // Mark as shown for this session
                sessionStorage.setItem('abandonedCartToastShown', 'true');
            }, 2000); // 2 seconds delay

            return () => clearTimeout(timer);
        }
    }, [items.length, navigate]);

    return null; // This component doesn't render anything itself
};

export default AbandonedCartToast;
