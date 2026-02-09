import fs from 'fs';

// Read the JSON file
const data = JSON.parse(fs.readFileSync('sonarcloud_issues.json', 'utf8'));

// Group issues by type and severity
const summary = {
    BUG: { CRITICAL: [], MAJOR: [], MINOR: [] },
    CODE_SMELL: { CRITICAL: [], MAJOR: [], MINOR: [] },
    VULNERABILITY: { CRITICAL: [], MAJOR: [], MINOR: [] }
};

data.issues.forEach(issue => {
    const type = issue.type || 'CODE_SMELL';
    const severity = issue.severity || 'MINOR';
    if (!summary[type][severity]) summary[type][severity] = [];
    summary[type][severity].push({
        file: issue.component.replace('facue28_perla_negra:', ''),
        line: issue.line,
        message: issue.message,
        rule: issue.rule
    });
});

// Generate report
console.log('📊 RESUMEN DE SONARCLOUD ISSUES\\n');
console.log(`Total: ${data.total} issues\\n`);

['BUG', 'VULNERABILITY', 'CODE_SMELL'].forEach(type => {
    const count = ['CRITICAL', 'MAJOR', 'MINOR'].reduce((sum, sev) => sum + summary[type][sev].length, 0);
    if (count > 0) {
        console.log(`\\n🔴 ${type}: ${count} total`);
        ['CRITICAL', 'MAJOR', 'MINOR'].forEach(severity => {
            if (summary[type][severity].length > 0) {
                console.log(`  - ${severity}: ${summary[type][severity].length}`);
                // Show first 3 examples
                summary[type][severity].slice(0, 3).forEach(issue => {
                    console.log(`    • ${issue.file}:${issue.line} - ${issue.message}`);
                });
                if (summary[type][severity].length > 3) {
                    console.log(`    ... y ${summary[type][severity].length - 3} más`);
                }
            }
        });
    }
});

// Group by file
console.log('\\n\\n📁 TOP 10 ARCHIVOS CON MÁS ISSUES:\\n');
const fileCount = {};
data.issues.forEach(issue => {
    const file = issue.component.replace('facue28_perla_negra:', '');
    fileCount[file] = (fileCount[file] || 0) + 1;
});

Object.entries(fileCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([file, count]) => {
        console.log(`  ${count} - ${file}`);
    });

// Group by rule
console.log('\\n\\n🔧 TOP 10 REGLAS MÁS COMUNES:\\n');
const ruleCount = {};
data.issues.forEach(issue => {
    const rule = issue.rule;
    ruleCount[rule] = (ruleCount[rule] || 0) + 1;
});

Object.entries(ruleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([rule, count]) => {
        console.log(`  ${count} - ${rule}`);
    });
