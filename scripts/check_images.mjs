const desireUrl = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/desire-coconut.webp";
const potionUrl = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/love-potion-champagne-e-lampone.webp";

async function check() {
    const res1 = await fetch(desireUrl, { method: 'HEAD' });
    console.log("Desire Coconut:", res1.status);

    const res2 = await fetch(potionUrl, { method: 'HEAD' });
    console.log("Love Potion:", res2.status);
    
    // Check if there are -min versions
    const res3 = await fetch(desireUrl.replace('.webp', '-min.webp'), { method: 'HEAD' });
    console.log("Desire Coconut min:", res3.status);

    const res4 = await fetch(potionUrl.replace('.webp', '-min.webp'), { method: 'HEAD' });
    console.log("Love Potion min:", res4.status);
}

check();
