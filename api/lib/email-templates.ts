const colors = {
    background: '#000000',
    backgroundAlt: '#141414',
    accent: '#3FFFC1',
    textPrimary: '#FFFFFF',
    textMuted: '#D1D5D4',
};

export function getBaseTemplate(content: string, title: string) {
    return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap');
        
        body {
            background-color: ${colors.background};
            margin: 0;
            padding: 0;
            font-family: 'Inter', Helvetica, Arial, sans-serif;
            color: ${colors.textPrimary};
        }
        .wrap {
            background-color: ${colors.background};
            padding: 40px 10px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${colors.backgroundAlt};
            border-radius: 32px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
        }
        .header {
            padding: 60px 40px 40px;
            text-align: center;
            background: linear-gradient(180deg, rgba(63, 255, 193, 0.08) 0%, rgba(0, 0, 0, 0) 100%);
        }
        .logo-text {
            font-family: 'Playfair Display', 'Times New Roman', serif;
            font-size: 32px;
            letter-spacing: 0.3em;
            color: ${colors.textPrimary};
            margin: 0;
            text-transform: uppercase;
            font-weight: 700;
        }
        .logo-sub {
            font-size: 10px;
            letter-spacing: 0.5em;
            color: ${colors.accent};
            margin-top: 10px;
            text-transform: uppercase;
        }
        .content {
            padding: 0 40px 40px;
        }
        .footer {
            padding: 40px;
            text-align: center;
            font-size: 11px;
            color: ${colors.textMuted};
            background-color: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            letter-spacing: 0.1em;
        }
        h2 {
            font-family: 'Playfair Display', serif;
            color: ${colors.textPrimary};
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            font-size: 15px;
            line-height: 1.7;
            color: ${colors.textMuted};
        }
        .accent {
            color: ${colors.accent};
        }
        .card {
            background-color: rgba(255, 255, 255, 0.03);
            border-radius: 20px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(63, 255, 193, 0.2), transparent);
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 16px 32px;
            background-color: ${colors.accent};
            color: #000000 !important;
            text-decoration: none;
            border-radius: 100px;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: ${colors.accent};
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        td {
            padding: 15px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="container">
            <div class="header">
                <div class="logo-text">PERLA NEGRA</div>
                <div class="logo-sub">Luxe & Sensualità</div>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} PERLA NEGRA • ITALIA<br>
                Sito Web: <a href="https://perla-negra.vercel.app" style="color: ${colors.accent}; text-decoration: none;">perla-negra.vercel.app</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}
