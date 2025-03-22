import dotenv from 'dotenv';
import { DefaultTheme } from '../src/chart/themes.js';
dotenv.config();

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

const CONSTANTS = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
  CACHE_MAX_AGE: parseInt(process.env.CACHE_MAX_AGE!, 10),
  DEFAULT_GITHUB_RETRY_DELAY: parseInt(
    process.env.DEFAULT_GITHUB_RETRY_DELAY!,
    10,
  ),
  DEFAULT_GITHUB_MAX_RETRY: parseInt(process.env.DEFAULT_GITHUB_MAX_RETRY!, 10),
  REVALIDATE_TIME: HOUR_IN_MILLISECONDS,
  LANGS_OUTPUT_FILE: 'src/languageMappings.json',
  DEVICON_URL:
    'https://raw.githubusercontent.com/devicons/devicon/master/icons/',
  LINGUIST_GITHUB:
    'https://raw.githubusercontent.com/github/linguist/main/lib/linguist/languages.yml',
  LANGUAGE_MAPPINGS_URL: process.env.LANGUAGE_MAPPINGS_URL!,
  DEFAULT_THEME: new DefaultTheme(),
};

CONSTANTS.LANGUAGE_MAPPINGS_URL += CONSTANTS.LANGS_OUTPUT_FILE;

export { CONSTANTS };
