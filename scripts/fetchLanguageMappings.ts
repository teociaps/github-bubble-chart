import fs from 'fs';
import { parse as yamlParse } from 'yaml';
import { CONSTANTS } from '../config/consts';
import imageToBase64 from 'image-to-base64';

// Known language name discrepancies map (GitHub vs Devicon)
const languageDiscrepancies: Record<string, string> = {
  'c#': 'csharp',
  'c++': 'cplusplus',
  'objective-c': 'objectivec',
  'css': 'css3',
  'scss': 'sass',
  'html': 'html5',
  // TODO: Add more discrepancies
};

async function fetchLanguageColors(): Promise<Record<string, { color: string }>> {
  try {
    console.log('Fetching language colors from GitHub...');
    const response = await fetch(CONSTANTS.LINGUIST_GITHUB);

    if (!response.ok) {
      throw new Error(`Failed to fetch language colors: ${response.statusText}`);
    }

    const data = yamlParse(await response.text());

    const languageColors: Record<string, { color: string }> = {};
    for (const [language, props] of Object.entries(data)) {
      if (typeof props === 'object' && 'color' in props!) {
        languageColors[language] = { color: props.color as string };
      }
    }

    return languageColors;
  } catch (error) {
    console.error('Failed to fetch language colors:', error);
    throw error;
  }
}

async function convertImageToBase64(url) {
  try {
    const base64 = await imageToBase64(url);
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image:', error);
  }
}

async function mapIconsToLanguages(
  languageColors: Record<string, { color: string }>,
): Promise<Record<string, { color: string; icon?: string }>> {
  const languageMappings: Record<string, { color: string; icon?: string }> = {};

  for (const [language, { color }] of Object.entries(languageColors)) {
    // Normalize language name using the discrepancies map
    const normalizedLanguage =
      languageDiscrepancies[language.toLowerCase().replace(' ', '')] ||
      language.toLowerCase().replace(' ', '');

    const iconUrl = `${CONSTANTS.DEVICON_BASEURL}/${normalizedLanguage}/${normalizedLanguage}-original.svg`; // TODO: check for different names (like plain instead original)
    const base64Icon = await convertImageToBase64(iconUrl);  
    languageMappings[language] = {
      color: color || '#000000', // Default to black if no color
      icon: base64Icon,
    };
  }

  return languageMappings;
}

// Merge Updated Colors and Icons
function mergeMappings(
  oldMappings: Record<string, { color: string; icon?: string }>,
  newMappings: Record<string, { color: string; icon?: string }>,
): Record<string, { color: string; icon?: string }> {
  const mergedMappings = { ...oldMappings };

  for (const [language, data] of Object.entries(newMappings)) {
    mergedMappings[language] = data; // Overwrite or add new mappings
  }

  return mergedMappings;
}

async function main() {
  try {
    // Fetch updated language colors
    const languageColors = await fetchLanguageColors();
    const newMappings = await mapIconsToLanguages(languageColors);

    // Load existing mappings
    let oldMappings: Record<string, { color: string; icon?: string }> = {};
    if (fs.existsSync(CONSTANTS.LANGS_OUTPUT_FILE)) {
      oldMappings = JSON.parse(fs.readFileSync(CONSTANTS.LANGS_OUTPUT_FILE, 'utf-8'));
    }

    // Merge and save updated mappings
    const updatedMappings = mergeMappings(oldMappings, newMappings);
    fs.writeFileSync(CONSTANTS.LANGS_OUTPUT_FILE, JSON.stringify(updatedMappings, null, 2));
    console.log(`Updated mappings written to ${CONSTANTS.LANGS_OUTPUT_FILE}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
