const u1 = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/desire-coconut.webp?width=800&format=webp&quality=75";
const u2 = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/love-potion-champagne-e-lampone.webp?width=800&format=webp&quality=75";

async function run() {
    const r1 = await fetch(u1, { method: 'HEAD' });
    console.log("Desire Coconut parameterized:", r1.status);

    const r2 = await fetch(u2, { method: 'HEAD' });
    console.log("Love Potion parameterized:", r2.status);
    
    // Check if the actual contents are empty if status is 200? Maybe not needed for HEAD
}
run();
