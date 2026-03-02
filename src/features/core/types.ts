export interface SiteConfig {
    whatsapp_number?: string;
    instagram_url?: string;
    facebook_url?: string;
    contact_email?: string;
    [key: string]: string | undefined; // For any other public config
}
