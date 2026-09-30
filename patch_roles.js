const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

if (!code.includes('user?.role === "SUPERADMIN"')) {
    code = code.replace(
        '{plan.status === "PROPOSED" && (', 
        '{plan.status === "PROPOSED" && user?.role === "SUPERADMIN" && ('
    );
    fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);
    console.log('Role gated!');
} else {
    console.log('Already gated');
}
