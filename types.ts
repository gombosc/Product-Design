/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PHOTOGRAPHIC_DIRECTIONS, VISUAL_STYLES } from './constants';

// --- TYPE DEFINITIONS ---

export type DirectionCategory = keyof typeof PHOTOGRAPHIC_DIRECTIONS;
export type VisualStyle = (typeof VISUAL_STYLES)[number];

export interface ProductImage {
  id: string;
  originalName: string;
  data: string;
  mimeType: string;
  processedData?: string;
  isProcessed?: boolean;
  palette?: string[];
}

export interface SelectedBackground {
  id: string;
  name: string;
  prompt: string;
  count: number;
  directions: { [key in DirectionCategory]?: string | null };
  matchPalette: boolean;
  negativePrompt: string;
}

export interface GeneratedImage {
  id: string;
  sourceId: string; // ID of the product image it was generated from
  data: string;
  mimeType: string;
  prompt: string;
  backgroundName: string;
  videoUrl?: string;
  isGeneratingVideo?: boolean;
}

export interface Preset {
  name: string;
  style: VisualStyle | null;
  backgrounds: SelectedBackground[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  productImages: ProductImage[];
  selectedStyle: VisualStyle | null;
  selectedBackgrounds: SelectedBackground[];
  generatedImages: GeneratedImage[];
}