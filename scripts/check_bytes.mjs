import fs from 'fs';

const u1 = "https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/desire-coconut.webp";

async function run() {
    const r1 = await fetch(u1);
    const b1 = await r1.arrayBuffer();
    const arr = new Uint8Array(b1);
    console.log("First bytes:", Array.from(arr.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' '));
}
run();
