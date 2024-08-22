import fs from 'fs';
import axios from 'axios';
import { BubbleData, createBubbleChart } from '@teociaps/bubble-chart';

// Default colors and icons for common languages
const defaultColors: Record<string, string> = {
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    TypeScript: '#2b7489',
    HTML: '#e34c26',
    CSS: '#563d7c',
    // TODO: add more languages
};
const defaultIcons: Record<string, string> = {
    JavaScript: 'https://icon.icepanel.io/Technology/svg/JavaScript.svg',
    Python: 'https://icon.icepanel.io/Technology/svg/Python.svg',
    Java: 'https://icon.icepanel.io/Technology/svg/Java.svg',
    TypeScript: 'typescript-icon.png',
    HTML: 'html-icon.png',
    CSS: 'css-icon.png',
    // TODO: fix icons and add more
};

// TODO remove: Function to generate a random color (for demo purposes)
function generateRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function validateBubbleData(data: BubbleData[]): BubbleData[] {
    return data.filter(item => item.value > 0);
}

async function getLanguagesFromGithub(username: string, token: string): Promise<BubbleData[]> {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: { Authorization: `token ${token}` }
        });
        
        const languages: Record<string, number> = {};

        for (const repo of response.data) {
            const langResponse = await axios.get(repo.languages_url, {
                headers: { Authorization: `token ${token}` }
            });

            for (const [lang, size] of Object.entries(langResponse.data)) {
                languages[lang] = (languages[lang] || 0) + (size as number);
            }
        }

        const bubbleData: BubbleData[] = Object.entries(languages).map(([name, value]) => ({
            name,
            value,
            color: defaultColors[name] || generateRandomColor(),
            icon: defaultIcons[name],
        }));

        return validateBubbleData(bubbleData);
    } catch (err: any) {
        console.error('Error fetching data from GitHub:', err.message);
        throw err;
    }
}

function getLanguagesFromConfig(configPath: string): BubbleData[] {
    try {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const rawData: Record<string, number> = JSON.parse(configContent); // TODO: add color and icon to json

        const bubbleData: BubbleData[] = Object.entries(rawData).map(([name, value]) => ({
            name,
            value,
            color: defaultColors[name] || generateRandomColor(),
            icon: defaultIcons[name],
        }));

        return validateBubbleData(bubbleData);
    } catch (err: any) {
        console.error('Error reading config file:', err.message);
        throw err;
    }
}

function saveBubbleChart(languages: BubbleData[], outputPath: string, format: string): void {
    try {
        const bubbleChart = createBubbleChart(languages, { titleOptions: { text: 'Test' } });
        fs.writeFileSync(outputPath, bubbleChart as string);
        console.log('Bubble chart saved to: ', outputPath);
    } catch (err: any) {
        console.error('Error generating or saving the bubble chart:', err.message);
        throw err;
    }
}

async function main(): Promise<void> {
    try {
        const useConfigFile = process.env.INPUT_USECONFIGFILE === 'true';
        const configFilePath = process.env.INPUT_CONFIGFILEPATH || '';
        const outputFilePath = process.env.INPUT_OUTPUTFILEPATH || 'bubble-chart.svg';
        const format = process.env.INPUT_FORMAT || 'svg';
        const githubToken = process.env.GITHUB_TOKEN || '';
        const username = process.env.GITHUB_REPOSITORY_OWNER || '';

        let languages: BubbleData[];

        if (useConfigFile) {
            if (!configFilePath) {
                throw new Error('Config file path must be provided when useConfigFile is true.');
            }
            languages = getLanguagesFromConfig(configFilePath);
        } else {
            if (!githubToken) {
                throw new Error('GitHub token is required to fetch language data.');
            }
            languages = await getLanguagesFromGithub(username, githubToken);
        }

        saveBubbleChart(languages, outputFilePath, format);
    } catch (err: any) {
        console.error('Failed to generate bubble chart:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export {
    getLanguagesFromGithub,
    getLanguagesFromConfig,
    saveBubbleChart,
    validateBubbleData,
    generateRandomColor,
    defaultColors,
    defaultIcons,
};
