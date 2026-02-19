export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (static assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets|sitemap.xml|robots.txt|manifest.webmanifest|images|icons|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css|woff|woff2|ttf|eot|otf|ttc|map|xml|txt|json)$).*)',
    ],
};

const BOT_AGENTS = [
    'googlebot',
    'yahoo',
    'bingbot',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'redditbot',
    'Applebot',
    'WhatsApp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'SkypeUriPreview',
    'nuzzel',
    'Discordbot',
    'Google Page Speed',
    'Qwantify',
    'pinterest',
    'pinterestbot',
    'Bitrix link preview',
    'XING-contenttabreceiver',
    'TelegramBot',
    'odklbot',
    'vkShare',
    'telegrambot'
];

'.js', '.css', '.xml', '.less', '.png', '.jpg', '.jpeg', '.gif',
    '.pdf', '.doc', '.txt', '.ico', '.rss', '.zip', '.mp3', '.rar',
    '.exe', '.wmv', '.doc', '.avi', '.ppt', '.mpg', '.mpeg', '.tif',
    '.wav', '.mov', '.psd', '.ai', '.xls', '.mp4', '.m4a', '.swf',
    '.dat', '.dmg', '.iso', '.flv', '.m4v', '.torrent', '.woff',
    '.ttf', '.svg', '.webmanifest', '.json', '.webp', '.map', '.woff2',
    '.eot', '.otf', '.ttc'
];

export default function middleware(request: Request) {
    const userAgent = request.headers.get('user-agent')?.toLowerCase();
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Check if it's a static file (double check in case matcher misses something)
    const isStaticFile = IGNORE_EXTENSIONS.some(ext => path.endsWith(ext));
    if (isStaticFile) {
        return; // Continue normally
    }

    // 2. Check if it's a bot
    const isBot = userAgent && BOT_AGENTS.some(bot => userAgent.includes(bot.toLowerCase()));

    if (isBot) {
        // 3. Rewrite to Prerender.io
        // PRERENDER_TOKEN must be set in Vercel Environment Variables
        const prerenderToken = process.env.PRERENDER_TOKEN;

        // Construct the new URL for Prerender.io
        const newUrl = `https://service.prerender.io/${request.url}`;

        // Create new headers, copying originals and adding the token
        const newHeaders = new Headers(request.headers);
        if (prerenderToken) {
            newHeaders.set('X-Prerender-Token', prerenderToken);
        }

        // Rewrite the request
        return fetch(newUrl, {
            headers: newHeaders,
            redirect: 'manual', // Prerender might handle redirects
        });
    }

    // Not a bot, continue normally
    return;
}
