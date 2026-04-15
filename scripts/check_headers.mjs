const u1 = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/desire-coconut.webp";

async function run() {
    const r1 = await fetch(u1, { method: 'HEAD' });
    console.log("Headers:");
    r1.headers.forEach((val, key) => {
        console.log(`${key}: ${val}`);
    });
}
run();
