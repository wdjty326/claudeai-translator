import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const extractPath = process.env['EXTRACT_PATH'];
const translatePath = process.env['TRANSLATE_PATH'];

const client = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

async function main() {
    if (!extractPath) {
        console.error('EXTRACT_PATH is not set');
        return;
    }

    if (!translatePath) {
        console.error('TRANSLATE_PATH is not set');
        return;
    }

    if (!fs.existsSync(translatePath)) {
        fs.mkdirSync(translatePath);
    }

    const maxTokens = 1024;

    fs.readdirSync(extractPath).forEach(async (file) => {
        const messages: Anthropic.Messages.MessageParam[] = []
        messages.push({ "role": "user", "content": "Please maintain the format of the text document, and translate only the Japanese text into Korean." })
    
        const content = fs.readFileSync(`${extractPath}/${file}`, 'utf-8');

        let i = 0;
        while (i < content.length) {
            messages.push({ "role": "user", "content": content.slice(i, i + 3000) })

            const message = await client.messages.create({
                max_tokens: maxTokens,
                messages: messages,
                model: 'claude-3-5-sonnet-latest',
            });

            const isFile = fs.existsSync(`${translatePath}/${file}`);
            if (!isFile) {
                fs.writeFileSync(`${translatePath}/${file}`, '');
            }
            fs.appendFileSync(`${translatePath}/${file}`, message.content[0].type === 'text' ? message.content[0].text : '');

            i += 3000;
        }

    })
}

main();