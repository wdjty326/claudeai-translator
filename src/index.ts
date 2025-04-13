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

    const messages: Anthropic.Messages.MessageParam[] = []
    messages.push({ "role": "user", "content": "Please maintain the format of the text document, and translate only the Japanese text into Korean." })

    fs.readdirSync(extractPath).forEach(async (file) => {
        const content = fs.readFileSync(`${extractPath}/${file}`, 'utf-8');
        let i = 0;
        while (i < content.length) {
            messages.push({ "role": "user", "content": content.slice(i, i + 1000) })
            i += 1000;
        }

        const message = await client.messages.create({
            max_tokens: 1024,
            messages: messages,
            model: 'claude-3-5-sonnet-latest',
        });

        fs.writeFileSync(`${file}`, message.content[0].type === 'text' ? message.content[0].text : '');
    })
}

main();