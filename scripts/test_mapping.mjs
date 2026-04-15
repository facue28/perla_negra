import { mapProductDBToProduct } from './src/features/products/services/productService.js';

const dbDesire = {
    "id": 30,
    "name": "Desire Coconut",
    "image_url": "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/desire-coconut.webp",
    "category": "Olio commestibile",
    "created_at": "2024-01-01T00:00:00Z",
    "price": 10
};

const dbPotion = {
    "id": 33,
    "name": "Love Potion Champagne E Lampone",
    "image_url": "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/love-potion-champagne-e-lampone.webp",
    "category": "Fragranza",
    "created_at": "2024-01-01T00:00:00Z",
    "price": 10
};

console.log("Desire mapped:", mapProductDBToProduct(dbDesire).image);
console.log("Potion mapped:", mapProductDBToProduct(dbPotion).image);
