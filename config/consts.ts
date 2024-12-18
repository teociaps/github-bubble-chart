import dotenv from 'dotenv';
import { LightTheme } from '../src/chart/themes.js';
dotenv.config();

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export const CONSTANTS = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
  CACHE_MAX_AGE: parseInt(process.env.CACHE_MAX_AGE!, 10),
  DEFAULT_GITHUB_RETRY_DELAY: parseInt(process.env.DEFAULT_GITHUB_RETRY_DELAY!, 10),
  REVALIDATE_TIME: HOUR_IN_MILLISECONDS,
  LANGS_OUTPUT_FILE: process.env.LANGS_OUTPUT_FILE!,
  DEVICON_BASEURL: process.env.DEVICON_BASEURL!,
  LINGUIST_GITHUB: process.env.LINGUIST_GITHUB!,
  DEFAULT_THEME: new LightTheme(),
};
