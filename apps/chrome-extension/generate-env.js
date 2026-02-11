const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const outputPath = path.join(__dirname, 'env.js');

function generateEnv() {
    try {
        if (!fs.existsSync(envPath)) {
            console.error('.env file not found. Creating default env.js');
            fs.writeFileSync(outputPath, 'export const env = { CHROME_EXTENSION_API_URL: "http://localhost:3005", CHROME_EXTENSION_WEB_APP_URL: "http://localhost:3000" };\n');
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};

        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });

        const outputContent = `export const env = ${JSON.stringify(envVars, null, 2)};\n`;
        fs.writeFileSync(outputPath, outputContent);
        console.log('Successfully generated env.js');
    } catch (error) {
        console.error('Error generating env.js:', error);
        process.exit(1);
    }
}

generateEnv();
