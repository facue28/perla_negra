const u1 = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/desire-coconut.webp";
const u2 = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/love-potion-champagne-e-lampone.webp";

async function run() {
    const r1 = await fetch(u1);
    const b1 = await r1.arrayBuffer();
    console.log("Desire Coconut size:", b1.byteLength);

    const r2 = await fetch(u2);
    const b2 = await r2.arrayBuffer();
    console.log("Love Potion size:", b2.byteLength);
}
run();
