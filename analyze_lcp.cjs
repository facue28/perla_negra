const fs = require('fs');

try {
    const report = JSON.parse(fs.readFileSync('lighthouse-report-react-lcp.json', 'utf8'));
    const lcpAudit = report.audits['largest-contentful-paint-element'];

    if (lcpAudit && lcpAudit.details && lcpAudit.details.items) {

        console.log('Items Length:', lcpAudit.details.items.length);

        if (lcpAudit.details.items.length > 1) {
            const phasesTable = lcpAudit.details.items[1];
            phasesTable.items.forEach(item => {
                console.log(`${item.phase}: ${item.timing} (${item.percent})`);
            });
        }

        const table = lcpAudit.details.items[0];
        console.log('Table Headings:', JSON.stringify(table.headings, null, 2));

        if (table.items && table.items.length > 0) {
            console.log('Row Content:', JSON.stringify(table.items[0], null, 2));
        }
    } else {
        console.log('LCP Audit or details missing');
    }
} catch (e) {
    console.error('Error:', e);
}
