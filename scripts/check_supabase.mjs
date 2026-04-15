import fs from 'fs';

const SUPABASE_URL = "https://hkedgklpsksezxxymdgc.supabase.co";
const SUPABASE_KEY = "sb_publishable_yqy0q5cFA_SS3CV--dECSg_Z3_01rFF";

async function fetchProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,image_url,image2_url,image3_url`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const data = await response.json();
        
        console.log("All matching items:");
        const targets = data.filter(p => 
            p.name.toLowerCase().includes('desire') || 
            p.name.toLowerCase().includes('love potion')
        );
        console.log(JSON.stringify(targets, null, 2));
    } catch (e) {
        console.error(e);
    }
}

fetchProducts();
