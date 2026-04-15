const base = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/";

async function run() {
    const p1 = await fetch(base + "olio.webp", { method: 'HEAD' });
    console.log("olio.webp:", p1.status);

    const p2 = await fetch(base + "fragancia.webp", { method: 'HEAD' });
    console.log("fragancia.webp:", p2.status);

    const p3 = await fetch(base + "lubricante.webp", { method: 'HEAD' });
    console.log("lubricante.webp:", p3.status);
}
run();
