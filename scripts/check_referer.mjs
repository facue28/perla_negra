const u1 = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/desire-coconut.webp";

async function run() {
    const r1 = await fetch(u1, {
        headers: {
            "Referer": "https://perlanegra.store/"
        }
    });
    console.log("Status with perlanegra.store:", r1.status);
    
    const r2 = await fetch(u1, {
        headers: {
            "Referer": "https://perlanegra-store.vercel.app/"
        }
    });
    console.log("Status with vercel.app:", r2.status);
}
run();
