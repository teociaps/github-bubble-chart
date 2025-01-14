export interface BubbleData {
  name: string;
  value: number;
  color: string;
  icon?: string;
}

interface LanguageMapping {
  color: string;
  icon: string;
}
export type LanguageMappings = Record<string, LanguageMapping>;
