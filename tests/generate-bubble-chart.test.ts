import fs from 'fs';
import axios from 'axios';
import {
    getLanguagesFromGithub,
    getLanguagesFromConfig,
    saveBubbleChart,
    validateBubbleData,
    defaultColors,
    defaultIcons,
} from '../src/generate-bubble-chart';
import { createBubbleChart, BubbleData } from '@teociaps/bubble-chart';

// Mock the dependencies
jest.mock('fs');
jest.mock('axios');
jest.mock('@teociaps/bubble-chart', () => ({
    createBubbleChart: jest.fn(),
}));

const mockedAxiosGet = axios.get as jest.Mock;

describe('Bubble Chart Generation', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getLanguagesFromGithub should fetch languages correctly', async () => {
        const username = 'testuser';
        mockedAxiosGet
            .mockResolvedValueOnce({
                data: [
                    { languages_url: 'https://api.github.com/repos/testuser/repo1/languages' },
                    { languages_url: 'https://api.github.com/repos/testuser/repo2/languages' },
                ],
            })
            .mockResolvedValueOnce({ data: { JavaScript: 1000, HTML: 500 } })
            .mockResolvedValueOnce({ data: { Python: 300, CSS: 200 } });

        const result = await getLanguagesFromGithub(username, 'fake-token');

        expect(result).toEqual([
            { name: 'JavaScript', value: 1000, color: defaultColors.JavaScript, icon: defaultIcons.JavaScript },
            { name: 'HTML', value: 500, color: defaultColors.HTML, icon: defaultIcons.HTML },
            { name: 'Python', value: 300, color: defaultColors.Python, icon: defaultIcons.Python },
            { name: 'CSS', value: 200, color: defaultColors.CSS, icon: defaultIcons.CSS },
        ]);
        expect(mockedAxiosGet).toHaveBeenCalledTimes(3);
    });

    test('getLanguagesFromConfig should read configuration correctly', () => {
        const mockConfig = '{"JavaScript": 1000, "Python": 500}';
        (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

        const result = getLanguagesFromConfig('path/to/config.json');

        expect(result).toEqual([
            { name: 'JavaScript', value: 1000, color: defaultColors.JavaScript, icon: defaultIcons.JavaScript },
            { name: 'Python', value: 500, color: defaultColors.Python, icon: defaultIcons.Python },
        ]);
        expect(fs.readFileSync).toHaveBeenCalledWith('path/to/config.json', 'utf-8');
    });

    test('saveBubbleChart should generate and save chart', () => {
        const mockLanguages: BubbleData[] = [
            { name: 'JavaScript', value: 1000, color: '#f1e05a', icon: 'javascript-icon.png' },
            { name: 'Python', value: 500, color: '#3572A5', icon: 'python-icon.png' },
        ];
        const mockChart = Buffer.from('fake-chart-data');
        (createBubbleChart as jest.Mock).mockReturnValue(mockChart);

        saveBubbleChart(mockLanguages, 'output/path.png', 'png');

        expect(createBubbleChart).toHaveBeenCalledWith(mockLanguages, { titleOptions: { text: 'Test' } });
        expect(fs.writeFileSync).toHaveBeenCalledWith('output/path.png', mockChart);
    });

    test('validateBubbleData should filter out invalid entries', () => {
        const data: BubbleData[] = [
            { name: 'JavaScript', value: 1000, color: '#f1e05a' },
            { name: 'Python', value: 0, color: '#3572A5' },
            { name: 'Java', value: -50, color: '#b07219' },
        ];

        const result = validateBubbleData(data);

        expect(result).toEqual([{ name: 'JavaScript', value: 1000, color: '#f1e05a' }]);
    });

    test('should handle errors in getLanguagesFromGithub', async () => {
        mockedAxiosGet.mockRejectedValueOnce(new Error('GitHub API error'));

        await expect(getLanguagesFromGithub('testuser', 'fake-token')).rejects.toThrow('GitHub API error');
    });

    test('should handle errors in getLanguagesFromConfig', () => {
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw new Error('File read error');
        });

        expect(() => getLanguagesFromConfig('path/to/config.json')).toThrow('File read error');
    });

    test('should handle errors in saveBubbleChart', () => {
        (createBubbleChart as jest.Mock).mockImplementation(() => {
            throw new Error('Chart generation error');
        });

        expect(() => saveBubbleChart([], 'output/path.png', 'png')).toThrow('Chart generation error');
    });
});
