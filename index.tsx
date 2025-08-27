/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality, Part } from "@google/genai";

// A list of diverse, high-quality background prompts for random generation
const DIVERSE_BACKGROUND_PROMPTS = [
  'on a modern, minimalist beach house terrace overlooking a serene ocean at sunset.',
  'in a lush, private garden with vibrant flowers and soft, dappled sunlight.',
  'in a chic New York City loft apartment with exposed brick and a view of the skyline.',
  'inside a luxurious Parisian Dior store, surrounded by elegance and marble.',
  'on a rustic wooden table in a sunlit, cozy kitchen with fresh herbs.',
  'on a dramatic volcanic black sand beach with moody, overcast skies.',
  'on a sleek, futuristic product display with neon lights and a reflective surface.',
  'in a tranquil zen garden with raked sand, mossy rocks, and a cherry blossom tree.',
  'on a bed of shimmering, iridescent pearls and white silk fabric.',
  'on a snowy mountop under a clear blue sky, with pristine, untouched snow.',
  'against a backdrop of vibrant, abstract geometric shapes and bold colors.',
  'in a cozy, dimly lit library with towering bookshelves and a warm fireplace.',
];

const VISUAL_STYLES = [
    { name: 'Hyper Realistic', description: 'Ultra-detailed, photorealistic rendering with lifelike textures and lighting.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L6 7l6 5 6-5-6-5z"/><path d="M6 17l6 5 6-5"/><path d="M6 12l6 5 6-5"/></svg>`, prompt: 'Create a hyper-realistic, high-resolution photograph. Emphasize lifelike textures, natural lighting, and crisp details to the point of being indistinguishable from a real photo.' },
    { name: '3D Claymation', description: 'Charming, handcrafted look with visible fingerprints and soft, rounded shapes.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.7.7a5.4 5.4 0 0 0 0 7.65l.7.7a5.4 5.4 0 0 0 7.65 0l.7-.7a5.4 5.4 0 0 0 0-7.65l-.7-.7z"/><path d="m9 15 1-1"/><path d="m14 10-1 1"/><path d="m11 13 2-2"/><path d="m13 11 2-2"/><path d="m8 12 3-3"/></svg>`, prompt: 'Render the scene in a 3D claymation style. Everything should look handcrafted from modeling clay, with soft, rounded edges, visible fingerprints, and a slightly imperfect, tactile quality.' },
    { name: 'Ghibli-Inspired', description: 'Lush, hand-painted anime style with a sense of wonder and beautiful landscapes.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 16a2.5 2.5 0 0 1 5 0c0 1.4-1.1 2.5-2.5 2.5S2.5 17.4 2.5 16Z"/><path d="M21.5 16a2.5 2.5 0 0 0-5 0c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5Z"/><path d="M7.5 16v-4.5a2.5 2.5 0 0 1 5 0V16"/><path d="M2.5 16h5"/><path d="M16.5 16h5"/><path d="M12.5 11.5a2.5 2.5 0 0 1-5 0V7a5 5 0 0 1 10 0v4.5a2.5 2.5 0 0 1-5 0Z"/></svg>`, prompt: 'Illustrate the scene in a Ghibli-inspired anime style. Use lush, hand-painted watercolor backgrounds, soft lighting, a nostalgic and whimsical atmosphere, and expressive details.' },
    { name: 'Vintage Polaroid', description: 'Faded colors, soft focus, and a classic white border for a nostalgic, retro feel.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M6.5 12.5a2.5 2.5 0 0 1 5 0V15H9v-2.5a2.5 2.5 0 0 1-2.5-2.5V10"/><path d="M15 10h2.5a2.5 2.5 0 0 1 0 5H15v-5Z"/></svg>`, prompt: 'Simulate a vintage Polaroid photograph. Apply a soft focus, faded color palette with a warm yellow tint, light leaks, and a classic instant film border to the final image.' },
    { name: 'Isometric 3D', description: 'Clean, stylized 3D graphics on a floating diorama with a clean, playful aesthetic.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.12 6.4-6.05-4.06a2 2 0 0 0-2.17-.02L2.92 6.42a2 2 0 0 0-1.01 1.75v8.52a2 2 0 0 0 1.13 1.78l6.1 3.94a2 2 0 0 0 2.02 0l6.08-3.94a2 2 0 0 0 1.13-1.78V8.1a2 2 0 0 0-.98-1.7z"/><path d="M12 22V12"/><path d="m22 8-10 7-10-7"/><path d="M12 12 2.92 6.42"/></svg>`, prompt: 'Create a scene as a clean, isometric 3D illustration. The environment should be a small, floating diorama with simplified geometry, a bright color palette, and soft, ambient lighting.' },
    { name: 'Blueprint Schematic', description: 'Technical, monochrome line art on a blue background, as if from an engineer\'s draft.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.28 21.28H2.72V2.72h18.56Z"/><path d="M12 16.27V7.72"/><path d="m16.27 12-8.55 0"/><path d="M12 2.72v18.56"/><path d="M2.72 12h18.56"/><path d="m15.09 15.09-6.18-6.18"/><path d="m15.09 8.91-6.18 6.18"/></svg>`, prompt: 'Generate the image as a technical blueprint schematic. Use white line art with annotations on a deep blue background. The style should be precise, clean, and analytical.' },
    { name: 'Pop Art', description: 'Bold outlines, vibrant, blocky colors, and Ben-Day dots, in the style of Warhol.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="17"cy="17" r="2"/></svg>`, prompt: 'Recreate the scene in a vibrant Pop Art style, reminiscent of Andy Warhol. Use bold, black outlines, flat planes of saturated color, and incorporate halftone or Ben-Day dot patterns.' },
    { name: 'Risograph Print', description: 'Grainy texture, limited color palette, and slight misalignments for an artistic, printed look.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="15" r="2"/><path d="m14 13-2 4 2 3"/></svg>`, prompt: 'Simulate a Risograph print. The image should have a characteristic grainy texture, use a limited and bright color palette (e.g., 2-3 colors), and show slight, charming misalignments between color layers.' },
    { name: 'Oil Painting', description: 'Rich, textured brushstrokes and deep, blended colors, as if painted on canvas.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6.273a2 2 0 1 0-4 0v11.454a2 2 0 1 0 4 0v-2.864a2 2 0 0 1 4 0v2.864a2 2 0 1 0 4 0V6.273a2 2 0 1 0-4 0v3.454a2 2 0 0 1-4 0Z"/><path d="M18 9.727a2 2 0 1 0-4 0v3.454a2 2 0 1 0 4 0Z"/></svg>`, prompt: 'Render the scene as a classical oil painting. Use visible, textured brushstrokes, rich and deep color blending, and the dramatic lighting (chiaroscuro) characteristic of the Old Masters.' },
    { name: 'Watercolor Sketch', description: 'Soft, translucent washes of color, loose lines, and visible paper texture.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><path d="M11.5 8C8 8 8 12 12 12s4-4 4-4"/></svg>`, prompt: 'Create the image in the style of a watercolor sketch. Use soft, translucent color washes that bleed into each other, loose ink outlines, and ensure the underlying texture of the watercolor paper is visible.' },
    { name: 'Blender 3D Render', description: 'Polished and clean 3D render with perfect lighting and smooth surfaces.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.466 7.5C15.643 4.237 16.3 2 12 2 7.7 2 8.357 4.237 7.534 7.5c-1.114 4.545 2.112 6.5 4.466 6.5s5.58-1.955 4.466-6.5z"/><path d="M12 14v8"/><path d="M12 18h.01"/></svg>`, prompt: 'Generate a clean, polished 3D render as if created in Blender. Focus on perfect, smooth surfaces, studio-quality three-point lighting, and realistic material shaders. The final image should look like professional 3D artwork.' },
    { name: '2D Flat Illustration', description: 'Minimalist vector art with simple shapes, no gradients, and a limited color palette.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3a2 2 0 0 0-1.7-.9H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16z"/></svg>`, prompt: 'Create a 2D flat vector illustration of the scene. Use only simple geometric shapes, solid blocks of color, a minimalist and limited color palette, and avoid any gradients or shadows.' },
    { name: 'Cinematic Noir', description: 'High-contrast black and white, dramatic shadows, and a moody, mysterious atmosphere.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`, prompt: 'Produce the image in a cinematic film noir style. It must be in a high-contrast black and white, with deep shadows, dramatic, hard lighting (low-key lighting), and a mysterious, moody atmosphere.' },
    { name: 'Double Exposure', description: 'A creative blend of the product and a secondary texture, like a forest or cityscape.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v-2a3 3 0 0 0-3-3H7"/><path d="M12 12v-2a3 3 0 0 1 3-3h2"/><path d="M12 12h-2a3 3 0 0 0-3 3v2"/><path d="M12 12h2a3 3 0 0 1 3 3v2"/></svg>`, prompt: 'Create a double exposure image. The primary silhouette should be the product, with a secondary, evocative image (like a dense forest or a sprawling cityscape) blended within its contours.' },
    { name: 'Pixel Art', description: 'Retro 16-bit video game aesthetic with a limited color palette and visible pixels.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="4" height="4"/><rect x="8" y="2" width="4" height="4"/><rect x="14" y="2" width="4" height="4"/><rect x="2" y="8" width="4" height="4"/><rect x="8" y="8" width="4" height="4"/><rect x="14" y="8" width="4" height="4"/><rect x="2" y="14" width="4" height="4"/><rect x="8" y="14" width="4" height="4"/><rect x="14" y="14" width="4" height="4"/></svg>`, prompt: 'Generate the scene as 16-bit pixel art. The image should be composed of visible square pixels, use a limited color palette (e.g., 32 colors), and have the aesthetic of a classic SNES video game.' },
];

const DETAILED_BACKGROUNDS = [
    {
        category: "Aspirational Lifestyle & Home",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
        locations: [
            { name: "The Sun-drenched Scandinavian Loft", prompt: "A sun-drenched Scandinavian loft. Emphasize minimalist furniture, light wood floors, and large windows with sheer curtains. For the 6 variations, explore different times of day (morning light vs. afternoon glow), different camera angles (low angle vs. eye-level), and different arrangements of a few carefully chosen green plants." },
            { name: "The Artisan's Workshop", prompt: "A beautiful, messy artisan's workshop. Show raw materials like wood shavings, leather scraps, and ceramic dust. For the 6 variations, focus on different aspects of the craft: one shot close-up on wood shavings, another wider showing neatly hung tools, a third with warm, focused light on a workbench, and others showing different textures." },
            { name: "The 'Golden Hour' Family Kitchen", prompt: "A warm, lived-in family kitchen during the 'golden hour'. Feature stone countertops and a large farmhouse sink with sunlight streaming in. For the 6 variations, show different signs of life: a half-eaten apple, a child's drawing, fresh herbs on the counter, steam from a kettle, or flour dusted on a wooden board." },
            { name: "The Zen Reading Nook", prompt: "A cozy, quiet reading nook. Create a calm, focused mood with a comfortable armchair, a soft throw blanket, a stack of books, and a single warm lamp against a dark, moody wall. For the 6 variations, play with the lighting and composition: one focused on the book texture, one showing the soft glow of the lamp, another with a wider view of the quiet corner." },
            { name: "The Bustling Parisian Café Terrace", prompt: "A chic Parisian café terrace. Place the product on a small, round metal table on a cobblestone street. The background should be a soft blur of city life. For the 6 variations, capture different moments: one with a stylish passerby blurred in motion, one with classic architecture in the background, one with a croissant and coffee nearby." },
            { name: "The Modern Rooftop Terrace Garden", prompt: "A modern urban rooftop terrace garden at dusk. The scene is chic, with comfortable outdoor furniture, string lights, and lush potted plants against a stunning city skyline. For the 6 variations, explore different evening moods: one focusing on the warm glow of the lights, one with the city lights blurred into bokeh, one showing a wine glass nearby, and another from a higher angle." },
            { name: "The Cozy Log Cabin by the Fireplace", prompt: "A cozy log cabin interior in winter. Place the product on a rustic wooden mantelpiece or a sheepskin rug in front of a roaring fireplace. For the 6 variations, create different cozy atmospheres: one showing snow falling outside the window, one with steam rising from a mug, one focusing on the texture of the stone fireplace, and another with warm, flickering light." },
            { name: "The Minimalist Japanese Tea Room", prompt: "A serene and minimalist Japanese tea room. The scene features tatami mat flooring, shoji screen walls providing diffused light, and a simple ikebana flower arrangement. For the 6 variations, create different compositions that emphasize tranquility and balance: one with a low angle on the tatami, one with shadows from the shoji screen, and one focusing on the simple, natural textures." },
            { name: "The Collector's Library", prompt: "A dark academia-themed collector's library. The scene features floor-to-ceiling bookshelves, a rolling ladder, leather armchairs, and soft light from a green banker's lamp. For the 6 variations, create different compositions: one focused on the texture of old books, one with a chess game in progress, and one looking up at the towering shelves." },
            { name: "The Bohemian Balcony Garden", prompt: "A small but lush bohemian balcony garden at twilight. The scene is overflowing with terracotta pots, hanging plants, fairy lights, and a cozy woven hammock chair. For the 6 variations, capture different moods: one focusing on the glow of the fairy lights, one with a view of the quiet street below, and one close-up on the texture of a plant's leaves." },
            { name: "The Grand Piano in a Sunroom", prompt: "A polished black grand piano in a bright, airy sunroom. The room has glass walls and is surrounded by elegant indoor trees, bathed in natural light. For the 6 variations, explore different lighting and angles: one with dramatic shadows from the plants, one focusing on the reflection on the piano's surface, and one with a wide view of the entire serene space." }
        ]
    },
    {
        category: "Professional & Commercial Environments",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
        locations: [
            { name: "The Collaborative Tech Start-up Hub", prompt: "An innovative, collaborative tech start-up hub. The environment is an open-plan office with glass walls, whiteboards covered in ideas, and modern ergonomic furniture. For the 6 variations, show different aspects of the innovative atmosphere: one with developers blurred in the background, one reflecting the city view in the glass, one with charts on a screen." },
            { name: "The High-Fashion Retail Boutique", prompt: "A minimalist, luxurious, high-fashion retail boutique. Display the product on a marble pedestal or against a polished concrete wall with dramatic, focused lighting. For the 6 variations, experiment with minimalist compositions and dramatic lighting angles to highlight the product's design-forward and exclusive nature." },
            { name: "The Serene Wellness Spa", prompt: "A serene wellness spa. The backdrop is natural stone, bamboo, and soft, neatly folded towels, all bathed in diffused, tranquil light. For the 6 variations, suggest different spa elements: one near a steam-filled pool, one with orchid flowers, one with stacked hot stones, or one with gently flickering candles." },
            { name: "The Architect's Drafting Table at Night", prompt: "An architect's drafting table in a stark, high-contrast night scene. The only light source is a single desk lamp illuminating blueprints, precise rulers, and high-tech drawing tools on a dark surface. For the 6 variations, focus on precision and engineering through different close-ups: one on the blueprints, one on the tools, one showing the product's sharp lines." },
            { name: "The Bustling Stock Exchange Trading Floor", prompt: "An energetic, bustling stock exchange trading floor. The background is a dynamic blur of glowing data screens, stock tickers, and traders in motion. For the 6 variations, capture the energy differently: one with a shallow depth of field on a glowing red chart, one showing the motion blur of people, and one reflecting data in a polished floor." },
            { name: "The Michelin-Star Restaurant Kitchen", prompt: "The heart of a Michelin-star restaurant kitchen during service. The scene is one of controlled chaos and absolute precision, with stainless steel surfaces, copper pans, and focused chefs. For the 6 variations, highlight different aspects of professional culinary art: one with a chef's hands plating delicately, one with a burst of flame from a pan, and one focusing on the gleaming, organized tools." },
            { name: "The University Lecture Hall", prompt: "A grand, classic university lecture hall. The environment is intellectual and focused, with rich wood paneling, tiered seating, and a large chalkboard or projector screen. For the 6 variations, create different academic moods: one with 'golden hour' light streaming through arched windows, one from the perspective of the lecturer, and one focusing on the texture of old wooden desks." },
            { name: "The Executive Boardroom on the Top Floor", prompt: "A sleek, modern executive boardroom on a top floor with panoramic city views. The room features a massive polished glass table and high-tech video conferencing equipment. For the 6 variations, change the time of day for the city view (day, dusk, night), show different data visualizations on the screens, and focus on the luxurious materials like leather chairs and chrome accents." },
            { name: "The Scientist's Cleanroom Laboratory", prompt: "A sterile, brightly lit scientist's cleanroom laboratory. The scene is futuristic and precise, with stainless steel equipment, microscopes, and robotic arms. For the 6 variations, show different scientific activities in the blurred background: a scientist in a full protective suit, glowing liquids in vials, or complex diagrams on a holographic display." },
            { name: "The Luxury Hotel Lobby", prompt: "The opulent and grand lobby of a luxury hotel. The scene has a soaring ceiling, a massive crystal chandelier, polished marble floors, and luxurious seating areas. For the 6 variations, capture different aspects of luxury: one with a bellhop blurred in motion, one focusing on the intricate details of the chandelier, and one with a view towards a grand staircase." }
        ]
    },
    {
        category: "Rugged & Natural Settings",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 3 12 15 5 3"></polygon><polygon points="12 15 3 21 21 21 12 15"></polygon></svg>`,
        locations: [
            { name: "The Misty Redwood Forest Floor", prompt: "The floor of a misty redwood forest. Place the product on a bed of rich moss and fallen leaves, with giant, ancient trees disappearing into a thick fog above. For the 6 variations, play with the dappled light breaking through the canopy, creating different patterns and moods for each shot to emphasize a natural, grounded feeling." },
            { name: "The Volcanic Black Sand Beach at Dusk", prompt: "A dramatic volcanic black sand beach at dusk. Create high contrast between the dark, wet sand, white seafoam, and the deep orange and purple hues of the setting sun. For the 6 variations, capture different elemental moments: waves crashing, reflections on the wet sand, close-ups on the volcanic rock texture." },
            { name: "The Himalayan Mountain Basecamp", prompt: "A Himalayan mountain basecamp. Situate the product amidst high-tech tents, ropes, and ice axes on a snowy, rocky ledge in a vast, unforgiving landscape. For the 6 variations, convey extreme performance by showing different tools of survival and changing weather conditions like wind-blown snow or sharp, clear sunlight." },
            { name: "The Joshua Tree Desertscape at Sunrise", prompt: "A Joshua Tree desertscape at sunrise. The product sits on a warm, weathered rock next to a distinctive Joshua Tree, with a color palette of soft pinks, oranges, and purples. For the 6 variations, capture the changing light of the desert morning, with different angles of the sun creating long shadows and highlighting different textures." },
            { name: "The Amazon Rainforest Canopy Walkway", prompt: "High on a canopy walkway bridge in the Amazon rainforest. The scene is lush and exotic, surrounded by dense greenery, tropical flowers, and the blur of exotic birds. For the 6 variations, showcase the biodiversity: one with a toucan in the background, one with morning mist rising, one focusing on the textures of leaves and vines, and one looking down from a great height." },
            { name: "The Salt Flats at Midday", prompt: "A vast, minimalist salt flat landscape at midday. The ground is a perfectly flat, white expanse of salt crystals, and the sky is a deep, cloudless blue, creating a high-contrast, almost surreal environment. For the 6 variations, play with reflections, the texture of the salt, the harsh shadows, and the immense sense of scale." },
            { name: "The Underwater Coral Reef", prompt: "A vibrant, serene underwater coral reef. The product rests on a patch of white sand, surrounded by colorful coral, sea anemones, and the soft blur of tropical fish swimming by. For the 6 variations, capture different aquatic moments: one with shafts of sunlight filtering through the water, one with a sea turtle in the background, and one focusing on the intricate textures of the coral." },
            { name: "The Geothermal Hot Spring in Iceland", prompt: "On a dark volcanic rock beside a steaming, milky-blue geothermal hot spring in Iceland. The backdrop is a vast, moody landscape of snow-dusted, mossy lava fields. For the 6 variations, explore different natural effects: one with thick steam partially obscuring the background, one with the Northern Lights faintly visible at dusk, and one focusing on the contrast between the hot water and cold air." },
            { name: "The African Savannah at Sunset", prompt: "On a termite mound in the vast, golden African savannah at sunset. The scene is dramatic, with silhouetted acacia trees and a fiery sky. For the 6 variations, include different wildlife silhouettes in the distant background: a herd of elephants, a lone giraffe, or a flock of birds, each creating a different story." },
            { name: "The Inside of a Crystal Ice Cave", prompt: "Inside a glowing, crystal-clear ice cave. The product sits on a pedestal of ice as sunlight filters through the deep, translucent blue walls. For the 6 variations, play with the light: create different refraction patterns, show the texture of the ice up close, and capture the surreal, magical glow of the cave's interior." }
        ]
    },
    {
        category: "Abstract & Conceptual Studios",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
        locations: [
            { name: "The Monochromatic Color-Drenched Room", prompt: "A monochromatic room where the walls, floor, and ceiling are saturated in a single, bold color (e.g., Yves Klein Blue, Barbie Pink). The product is the only object. For the 6 variations, experiment with hard and soft shadows, different camera distances, and placing the product on different surfaces (floor, a matching pedestal) to explore its form." },
            { name: "The Bauhaus Geometric Studio", prompt: "A studio composed of simple, overlapping geometric shapes—circles, squares, triangles—in primary colors. The product is integrated into the composition. For the 6 variations, create completely different abstract compositions, playing with balance, scale, and the interaction between the product's shape and the geometric forms." },
            { name: "The Polished Concrete & Lush Moss Gallery", prompt: "A study in contrasts, placing the product at the intersection of a cold, grey, industrial concrete slab and a vibrant, soft patch of living green moss. For the 6 variations, explore the juxtaposition of textures through different macro shots and compositions, focusing on the balance between the two contrasting elements." },
            { name: "The Surreal Floating Islands-cape", prompt: "A dreamlike scene where the product rests on a small, grass-covered island floating in a soft, cloud-filled sky. For the 6 variations, alter the mood and time of day: one at sunrise, one with soft fog, one with other small islands in the distance, creating a whimsical and imaginative series of images." },
            { name: "The Infinity Mirror Room", prompt: "An infinity mirror room. The product is placed in a space where walls, floor, and ceiling are mirrors, creating an endless, geometric, and disorienting reflection of the product and single points of light. For the 6 variations, change the color of the lights (e.g., white, blue, gold) and the camera angle to create different mind-bending patterns." },
            { name: "The Suspended Silk Fabric Installation", prompt: "A soft, ethereal environment where the product is nestled within or placed upon large, flowing swathes of suspended silk fabric. The lighting is soft and diffused. For the 6 variations, use different colors of silk (e.g., white, dusty rose, deep blue), and create different compositions with the flowing, soft textures of the fabric." },
            { name: "The Shattered Glass & Light Studio", prompt: "A dramatic, high-contrast studio scene where the product sits amongst sharp, chaotic shards of shattered glass or mirror. Beams of light cut through the scene, creating sharp reflections and refractions. For the 6 variations, play with the lighting to create different dramatic effects: lens flares, long shadows, and glints off the sharp edges of the glass." },
            { name: "The Liquid Metal Sculpture Studio", prompt: "A high-contrast studio where the product is surrounded by flowing, morphing shapes of liquid metal, frozen mid-splash. The lighting is dramatic and specular. For the 6 variations, create different abstract sculptures with the liquid metal, play with the reflections on its surface, and use different colored lights to tint the metal (e.g., gold, silver, chrome)." },
            { name: "The Room of Floating Geometric Prisms", prompt: "A minimalist white room where dozens of translucent, colored glass prisms float in the air, catching and refracting a single beam of light into rainbows around the product. For the 6 variations, create different arrangements of the prisms and change the direction of the light source to cast different rainbow patterns and caustic effects on the walls." },
            { name: "The Sand Dune & Shadow Play Room", prompt: "A studio filled with fine, white sand sculpted into sensuous, flowing dunes. A single, harsh light source creates long, dramatic, and sharp-edged shadows across the landscape. For the 6 variations, change the shape of the dunes and the angle of the light to create completely different abstract shadow patterns, emphasizing texture and form." }
        ]
    },
    {
        category: "Futuristic & Sci-Fi Scenarios",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.2 18.2c-1.3-1.3-1-3.4.5-4.9s3.6-2.5 4.9-1.2c1.3 1.3 1 3.4-.5 4.9-1.5 1.4-3.6 2.5-4.9 1.2z"></path><path d="m13 13 6 6"></path><path d="M17.6 21.8c-1.3-1.3-.9-3.4.5-4.9s3.6-2.5 4.9-1.2c1.3 1.3 1 3.4-.5 4.9-1.5 1.5-3.6 2.6-4.9 1.2z"></path><path d="M18 12 12 6"></path><path d="M9.4 3.4c-1.3-1.3-1-3.4.5-4.9S13.5-.6 14.8.7c1.3 1.3 1 3.4-.5 4.9-1.5 1.5-3.6 2.6-4.9 1.2z"></path><path d="M8 8 2 2"></path></svg>`,
        locations: [
            { name: "The Sleek Mars Colony Habitation Pod", prompt: "The interior of a sleek, sterile, and highly functional Mars colony habitation pod. Feature white composite panels, integrated holographic interfaces, and a window looking out onto the red Martian landscape. For the 6 variations, show different holographic displays, views of Mars, and interactions with futuristic tech." },
            { name: "The Neon-Soaked Cyberpunk Alleyway", prompt: "A wet, reflective pavement in a cyberpunk alleyway, lit by towering holographic ads and bright neon signs in Japanese or Korean. Rain should be falling. For the 6 variations, alter the neon colors, the holographic ads, the amount of steam rising from vents, and the reflections on the wet ground to create a gritty, high-tech atmosphere." },
            { name: "The 'Solarpunk' Rooftop Garden", prompt: "A utopian 'Solarpunk' rooftop garden where nature and technology are seamlessly integrated. Surround the product with lush vertical gardens and solar panels disguised as leaves. For the 6 variations, show different clean, futuristic vehicles in the bright sky above, different plant life, and different angles of the optimistic, sustainable architecture." },
            { name: "The Zero-Gravity Space Station Hub", prompt: "The interior of a zero-gravity space station hub. The product floats weightlessly inside, with astronauts blurred in the background and a large cupola window offering a stunning view of Earth below. For the 6 variations, change the angle of the Earth, show different light conditions (sunrise from orbit), and add small, floating water droplets for effect." },
            { name: "The Bioluminescent Alien Jungle", prompt: "A mysterious and beautiful alien jungle at night. The environment is filled with exotic, glowing flora and fauna that provide a mysterious, bioluminescent light source. For the 6 variations, showcase different strange and glowing plants, different color palettes for the bioluminescence (e.g., blue/purple vs. green/yellow), and different levels of atmospheric mist." },
            { name: "The Sleek Hyperloop Train Interior", prompt: "The minimalist and sleek interior of a Hyperloop train traveling at supersonic speed. The scene is clean, with white or brushed metal surfaces and a window showing a blurred landscape rushing past. For the 6 variations, show different interior lighting schemes, different views from the window, and different futuristic seating arrangements to emphasize speed and advanced technology." },
            { name: "The Genetic Engineering Laboratory", prompt: "A high-tech genetic engineering laboratory. The scene is clean and futuristic, with glowing DNA helices projected in the air and robotic arms handling samples. For the 6 variations, change the color and complexity of the DNA projections, show different scientific equipment in the background, and vary the lighting to be either clinical and white or moody and colored." },
            { name: "The Command Bridge of a Starship", prompt: "On the command console of a starship bridge, overlooking a massive viewscreen showing a stunning celestial body. The lighting is low and focused on the control panels. For the 6 variations, show different scenes on the viewscreen: a swirling nebula, a ringed planet, a fleet of smaller ships, or the jump to hyperspace." },
            { name: "The Underwater City of Atlantis", prompt: "A futuristic underwater city, seen from a balcony inside a reinforced glass dome. Outside, bioluminescent sea creatures and advanced submersibles swim by glowing architecture. For the 6 variations, showcase different underwater views and creatures: a majestic whale-like creature, a school of shimmering fish, or another bubble city in the distance." }
        ]
    },
    {
        category: "Historical & Vintage Eras",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        locations: [
            { name: "The Art Deco Speakeasy Bar", prompt: "A hidden, opulent Art Deco speakeasy bar from the 1920s. Feature geometric brass inlays, velvet seating, and low, warm lighting. For the 6 variations, include different background elements like classic cocktail glasses, wisps of cigar smoke, a jazz musician blurred in the background, or light reflecting off a crystal decanter." },
            { name: "The 1960s California Case Study House", prompt: "An iconic Mid-Century Modern California Case Study House. Emphasize clean lines, floor-to-ceiling glass, and a seamless flow between the minimalist interior and a sun-drenched patio. For the 6 variations, showcase different classic furniture pieces (like an Eames lounge chair), different views of the pool, and different times of day." },
            { name: "The Victorian Explorer's Study", prompt: "A Victorian explorer's study filled with curiosities from around the globe. The scene has dark mahogany wood, brass scientific instruments, and hand-drawn maps. For the 6 variations, feature different artifacts in the background: a globe, a magnifying glass, taxidermy under a glass dome, or a ship in a bottle." },
            { name: "The 1980s Neon and Chrome Arcade", prompt: "A dark 1980s arcade, lit only by the glowing screens and gaudy marquees of classic arcade cabinets. For the 6 variations, place the product on different arcade machines, show different game graphics on the screens, and play with the reflections of the neon lights on chrome surfaces to create a nostalgic, electric feel." },
            { name: "The Ancient Roman Villa Courtyard", prompt: "The open-air courtyard of a sunlit ancient Roman villa. The scene features mosaic floors, a central marble fountain, columns, and lush green plants. For the 6 variations, capture different classical moods: one with harsh midday sun creating sharp shadows, one focusing on the texture of the mosaics, and one with a Roman statue in the background." },
            { name: "The Roaring 50s American Diner", prompt: "A classic, roaring 50s American diner. The environment is nostalgic, with red vinyl booths, a checkered floor, a long chrome-edged counter, and neon signs. For the 6 variations, show different diner scenes: one on the counter next to a milkshake, one in a booth with a jukebox selector, and one reflecting the neon lights in its surface." },
            { name: "The Elizabethan Theatre Stage", prompt: "The wooden stage of an Elizabethan theatre, like The Globe. The scene is dramatic, lit by candlelight or daylight from an open roof, with rich, heavy curtains in the background. For the 6 variations, create different theatrical moments: one with a single spotlight, one from the audience's perspective, and one backstage amongst props and ropes." },
            { name: "The Wild West Saloon", prompt: "On a polished wooden bar in a classic Wild West saloon. The background is moody, featuring a piano player, swinging doors, and the low, warm light of oil lamps. For the 6 variations, capture different saloon moments: one with a poker game in the blurred background, one focusing on the texture of the aged wood, and one with the silhouette of a cowboy in the doorway." },
            { name: "An Ancient Egyptian Pharaoh's Tomb", prompt: "Inside a newly discovered pharaoh's tomb. The product is placed among golden artifacts and hieroglyph-covered walls, lit by an explorer's torch. For the 6 variations, create different compositions focusing on different treasures: a golden sarcophagus, canopic jars, or intricate wall paintings, all with dramatic, flickering light." },
            { name: "The 1970s Disco Dance Floor", prompt: "At the center of a vibrant, flashing 1970s disco dance floor. The product is illuminated by a spinning disco ball, with colorful lights and dancing silhouettes. For the 6 variations, play with the light effects: lens flares from the lights, long exposure motion trails from the dancers, and different color schemes on the flashing floor." }
        ]
    },
    {
        category: "High-Energy & Motion",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        locations: [
            { name: "The Urban Skatepark at Magic Hour", prompt: "An urban skatepark with concrete bowls and rails, bathed in the warm, long-shadowed light of magic hour. Surround the scene with graffiti art. For the 6 variations, capture different moments of kinetic energy: a skater blurred in motion mid-air, light glinting off a rail, or different compositions of the concrete forms." },
            { name: "The Professional E-Sports Arena Stage", prompt: "The massive stage of a professional e-sports arena, under intense, colored spotlights. Giant LED screens in the background show gameplay. For the 6 variations, show different game graphics, different colored lighting schemes (blues, reds, purples), and different levels of atmospheric haze or smoke to create a high-tech, competitive tension." },
            { name: "The Rain-Slicked Formula 1 Pit Lane", prompt: "A rain-slicked Formula 1 pit lane, a scene of controlled chaos and extreme precision. Mechanics move in a blur and sparks fly. For the 6 variations, capture different high-speed moments: a car speeding past, reflections in the wet asphalt, a close-up on high-performance equipment, or the intense focus of the pit crew." },
            { name: "The Backstage of a Rock Music Festival", prompt: "A candid, behind-the-scenes moment backstage at a rock music festival. Place the product on a roadie case amidst a tangle of cables, guitars, and setlists. For the 6 variations, alter the background details: the muffled roar of the crowd, stage lights spilling in, a glimpse of the band, or different musical instruments." },
            { name: "The Professional Boxing Ring Under Lights", prompt: "A professional boxing ring, under a single, harsh spotlight in a dark, hazy arena. The scene is intense and focused, with the ropes of the ring framing the shot. For the 6 variations, capture the drama: one with a low angle from the canvas, one with sweat droplets flying in the air (conceptually), and one with the blurred crowd in the background." },
            { name: "A World Cup Ski Slalom Course", prompt: "A World Cup ski slalom course on a sunny day. The scene is filled with speed and precision, with the product placed on the pristine snow next to a colorful gate. For the 6 variations, show a skier blurred in high-speed motion in the background, snow spraying into the air, and different angles of the dramatic, steep mountain." },
            { name: "A Dirt Bike Rally in the Desert", prompt: "A desert dirt bike rally. The atmosphere is thick with adrenaline, dust, and the roar of engines. The product is on a rock near the track. For the 6 variations, capture the rugged action: one with a bike kicking up a massive plume of dust, one with the heat haze rising from the desert floor, and one with the setting sun creating a dramatic, dusty backdrop." },
            { name: "The Crest of a Surfing Wave", prompt: "Conceptually captured on the crest of a massive, curling surfing wave. The scene is dynamic, with spray flying and the water a brilliant, translucent blue. For the 6 variations, change the time of day (midday sun vs. sunset), the size of the wave, and the angle of the shot (from the beach vs. in the water)." },
            { name: "A Parkour Free-runner's Rooftop Leap", prompt: "Captured mid-moment as a parkour athlete leaps between two skyscrapers. The product is in sharp focus while the city below is a dizzying, motion-blurred view. For the 6 variations, alter the perspective: one looking straight down, one looking up at the leaper against the sky, and one with a dramatic lens flare from the sun." },
            { name: "The Eye of a Tornado", prompt: "A dramatic, conceptual scene from the surprisingly calm eye of a massive tornado. The product sits on the ground as the vortex walls swirl with dust and debris around it. For the 6 variations, show different types of debris in the vortex (farmhouse, car), alter the lighting within the eye (sunny vs. dark and ominous), and change the ground texture." }
        ]
    },
    {
        category: "Macro & Texture Focus",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
        locations: [
            { name: "A Drop of Morning Dew on a Spider's Web", prompt: "An extreme macro shot showing a perfect spherical drop of morning dew on an intricate spider's web, refracting the light. For the 6 variations, change the color of the refracted light, the angle of the sun, and the composition of the web's delicate, precise silk threads." },
            { name: "Sunlight Through a Glass of Iced Hibiscus Tea", prompt: "A sensory shot focusing on sunlight shining through a glass of iced hibiscus tea. Capture condensation dripping down the glass and the deep crimson liquid glowing. For the 6 variations, explore different aspects of the sensory experience: a close-up on the condensation, light hitting the ice cubes, a mint leaf garnish, or the vibrant color of the tea." },
            { name: "The Close-up Weave of Raw Selvedge Denim", prompt: "A macro view of the thick, indigo-dyed cotton threads of raw selvedge denim. Show the rich texture and imperfections that signify quality craftsmanship. For the 6 variations, use different lighting angles to highlight the texture, the contrast of the stitching, a leather patch, or a brass rivet." },
            { name: "Molten Glass Being Shaped by an Artisan", prompt: "Conceptually link the product to a glowing, semi-liquid orb of molten glass at the end of a blowpipe, capturing a moment of transformation, heat, and skilled creation. For the 6 variations, show different stages of the glass-blowing process, focusing on the intense heat, the artisan's tools, and the changing shape of the glass." },
            { name: "The Frost Patterns on a Window Pane", prompt: "An extreme close-up of delicate, crystalline frost patterns forming on a cold window pane. The scene is cold, geometric, and beautiful. For the 6 variations, explore different frost patterns, the quality of the soft morning light filtering through, and the contrast between the sharp ice crystals and the soft blur of the world outside." },
            { name: "Bubbles Rising in a Glass of Champagne", prompt: "A macro shot of effervescent bubbles rising in a crystal glass of champagne. The scene is luxurious, celebratory, and full of motion. For the 6 variations, capture the bubbles from different angles, play with the golden light refracting through the glass, and create different compositions that feel elegant and dynamic." },
            { name: "The Polished Grain of a Rare Wood Burl", prompt: "A macro view of the intricate, polished grain of a rare wood burl. The scene is natural, luxurious, and detailed. For the 6 variations, use different lighting to highlight the rich colors and swirling patterns of the wood, focusing on the incredible natural texture and craftsmanship of the polished surface." },
            { name: "The Surface of a Geode Crystal", prompt: "An extreme close-up on the glittering, crystalline surface inside a split-open amethyst geode. The light refracts off countless tiny, purple facets. For the 6 variations, change the lighting to create different sparkling effects, focus on different crystal formations, and vary the depth of field to create a range of abstract, jeweled backgrounds." },
            { name: "The Oiled Feathers of a Peacock", prompt: "A macro shot focusing on the iridescent, complex patterns and vibrant colors of a peacock's feather. The 'eye' of the feather is a key element. For the 6 variations, explore the texture by changing the lighting angle to highlight different shimmering colors (blues, greens, golds), and create different abstract compositions from the feather's patterns." },
            { name: "The Cracking Surface of Dried Earth", prompt: "A close-up of the geometric, cracked patterns of a dried-up riverbed. The texture is rough, arid, and detailed. For the 6 variations, alter the lighting to create different shadow lengths within the cracks (morning vs. midday), show a tiny green sprout emerging from one crack, and vary the color of the earth from rich brown to pale clay." }
        ]
    },
    {
        category: "Cultural & Festive Gatherings",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        locations: [
            { name: "A Mediterranean Alfresco Dinner Party", prompt: "A long wooden table set under olive trees and string lights for a Mediterranean alfresco dinner party. It's laden with rustic dishes, wine, and laughter. For the 6 variations, capture different moments of communal connection: hands reaching for bread, blurred figures sharing a meal, candlelight, or a close-up on the food." },
            { name: "A Lantern-Lit Night Market in Southeast Asia", prompt: "A vibrant, sensory-rich night market in Southeast Asia. The product is amidst the organized chaos, surrounded by steam from food stalls and colorful textiles. For the 6 variations, focus on different sensory details: the glow of lanterns, the vibrant colors of spices, the blur of the crowd, or the texture of handcrafted goods." },
            { name: "A Traditional Japanese Tea Ceremony", prompt: "A traditional Japanese tea ceremony (Chado), a scene of extreme precision, tranquility, and ritual. Place the product within a minimalist tatami mat room alongside a handcrafted ceramic bowl and bamboo whisk. For the 6 variations, focus on different elements of mindfulness and harmony: the steam from the tea, the texture of the tatami, the grain of the wood." },
            { name: "The Colorful Dia de los Muertos Ofrenda", prompt: "A brightly decorated Dia de los Muertos ofrenda (altar). Surround the product with marigold flowers, sugar skulls, and flickering candles. For the 6 variations, create different compositions that are both celebratory and spiritual, focusing on the vibrant colors, the soft candlelight, and the intricate details of the offerings." },
            { name: "The Rio Carnival Parade Float", prompt: "A vibrant, energetic float in the middle of the Rio Carnival parade. The scene is an explosion of color, feathers, sequins, and motion, with dancers and drummers blurred in the background. For the 6 variations, capture the energy: one focusing on the texture of the feathers, one with confetti in the air, and one with the bright parade lights." },
            { name: "A Holi Festival Celebration in India", prompt: "The heart of a Holi festival celebration in India. The scene is joyful and chaotic, with people covered in vibrant colored powders. The product is placed cleanly amidst the explosion of color. For the 6 variations, show different colored powders being thrown in the air, different joyful expressions, and different plays of light and color." },
            { name: "A Classic English Garden Tea Party", prompt: "An elegant, classic English garden tea party. The product is on a table with a lace tablecloth, fine china, tiered cake stands, and surrounded by a beautiful blooming rose garden. For the 6 variations, create different elegant scenes: one focusing on a delicate teacup, one with a soft-focus background of the garden, and one with a slice of cake nearby." },
            { name: "The Running of the Bulls in Pamplona", prompt: "A scene of controlled chaos during the Running of the Bulls in Pamplona. The product is on a safe balcony overlooking a narrow street packed with runners and the blur of charging bulls. For the 6 variations, capture different moments of the festival's energy: one with a wide view of the crowded street, one focused on the red scarves of the runners, and one with a dramatic low angle." },
            { name: "The Yi Peng Lantern Festival in Thailand", prompt: "A magical night scene at the Yi Peng Lantern Festival in Thailand. The product is on a riverside platform as thousands of glowing paper lanterns are released into the sky. For the 6 variations, create different compositions focusing on the reflections in the water, the sheer number of lanterns filling the sky, and the soft, warm glow they cast on the surroundings." },
            { name: "A Venetian Masquerade Ball", prompt: "An opulent and mysterious scene from a Venetian masquerade ball. The product is on a velvet-draped table, surrounded by elegantly dressed figures in elaborate, mysterious masks. For the 6 variations, play with the moody, candlelit atmosphere: one focusing on the intricate detail of a mask, one with blurred dancing figures, and one with reflections in a grand mirror." }
        ]
    },
    {
        category: "Underground & Subculture Scenes",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><path d="m6.4 17.6 1.5-1.5"></path><path d="m17.6 6.4-1.5 1.5"></path><path d="m6.4 6.4 1.5 1.5"></path><path d="m17.6 17.6-1.5-1.5"></path></svg>`,
        locations: [
            { name: "A Berlin Underground Warehouse Rave", prompt: "A vast, industrial Berlin warehouse rave. The scene is raw, with exposed concrete and pipes, lit only by strobes and a single laser beam cutting through artificial fog. For the 6 variations, play with the lighting effects: strobing, silhouettes, lens flare from the laser, and the motion blur of the crowd to create an intense, counter-culture feel." },
            { name: "A Secret Library in a Gothic Cathedral", prompt: "A secret, vaulted library hidden behind a stone wall in a gothic cathedral, filled with ancient, leather-bound books. Light streams through a single stained-glass window. For the 6 variations, create different mysterious and arcane compositions, focusing on the light from the window, the texture of old paper, rows of books, and architectural details." },
            { name: "A DIY Punk Show in a Basement", prompt: "A cramped, low-ceilinged basement packed with people during a DIY punk show. The energy is explosive and raw. For the 6 variations, capture different gritty, candid moments of rebellion: motion blur from the crowd, a close-up on a ripped band poster, the raw energy of the band in the background, or reflections from a single bare lightbulb." },
            { name: "The Artist's Loft After a Painting Session", prompt: "A chaotic artist's loft after a massive painting session, Jackson Pollock-style. Canvases lean against walls and floors are covered in splattered paint. For the 6 variations, create different compositions focusing on the creative frenzy: close-ups on paint drips, different arrangements of canvases, or the product sitting on a stool with a few stray drops of paint." },
            { name: "A Tattoo Artist's Studio at Night", prompt: "A tattoo artist's studio late at night. The scene is edgy and focused, with a single light illuminating the artist's station, bottles of ink, and flash art on the walls. For the 6 variations, focus on different elements of the craft: the gleam of the tattoo machine, the vibrant colors of the ink, or the texture of the sketchbook." },
            { name: "An Abandoned Subway Station Graffiti Gallery", prompt: "An abandoned subway station, now a hidden gallery of vibrant, high-concept graffiti art. The scene is urban and decayed, but full of color and creativity, with light coming from grates above. For the 6 variations, showcase the product against different graffiti styles, play with the dramatic light shafts, and capture the texture of the peeling paint and concrete." },
            { name: "A Spearfishing Trip in a Cenote", prompt: "An adventurous scene in a mysterious, underwater cenote (a natural sinkhole). The product is on a rock ledge near the water's surface, with light beams piercing the crystal-clear water. For the 6 variations, show a spearfisher as a silhouette in the water below, play with the light beams, and capture the textures of the rock and jungle vines." },
            { name: "An Urban Explorer's Derelict Theatre", prompt: "Inside a beautiful, decaying abandoned theatre. The product is on the stage, illuminated by a single shaft of light from a hole in the ceiling, with peeling paint and dusty velvet seats. For the 6 variations, create different moody compositions: one focusing on the decaying architecture, one with dust motes dancing in the light beam, and one from the perspective of the empty orchestra pit." },
            { name: "A Hacker's Code-Filled Lair", prompt: "A dark room lit only by multiple monitors displaying cascading green computer code. The product sits on a desk amidst a tangle of wires and keyboards. For the 6 variations, play with the reflections of the code on the product and surrounding surfaces, show different types of code (graphs, text), and vary the number of monitors." },
            { name: "A Collector's Secret Vinyl Record Room", prompt: "A small, sound-proofed room lined with thousands of vinyl records. The product is on a high-end turntable, with vintage audio equipment glowing in the background. For the 6 variations, create different cozy and moody shots: one focusing on the texture of the record grooves, one with a close-up on the glowing amplifier tubes, and one showing the vastness of the record collection." }
        ]
    },
    {
        category: "Gourmet & Culinary Scenes",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.042 21.672L12 20l-3.042 1.672a1 1 0 0 1-1.451-1.054l.582-3.396-2.467-2.398a1 1 0 0 1 .554-1.705l3.41-.496 1.524-3.09a1 1 0 0 1 1.788 0l1.524 3.09 3.41.496a1 1 0 0 1 .554 1.705l-2.467 2.398.582 3.396a1 1 0 0 1-1.451 1.054Z"></path><path d="M8.333 2.002a2 2 0 1 0 3.334 0"></path><path d="M12.333 2.002a2 2 0 1 0 3.334 0"></path><path d="M16.333 2.002a2 2 0 1 0 3.334 0"></path></svg>`,
        locations: [
            { name: "The Rustic Italian Trattoria Kitchen", prompt: "A rustic Italian trattoria kitchen, filled with the smells and textures of fresh ingredients. For the 6 variations, show different angles and elements: one near a simmering pot of tomato sauce, one next to fresh pasta being rolled out, another with a glass of red wine, one with hanging garlic and herbs, and one on a wooden cutting board with flour." },
            { name: "The Modern Patisserie Counter", prompt: "The pristine, modern counter of a French patisserie, with rows of colorful and intricate pastries under clean glass. For the 6 variations, adjust the focus and composition: one sharp on the product with pastries blurred, one showing the reflection in the glass, another from the baker's perspective, and others alongside different types of desserts." },
            { name: "The Bustling Farmer's Market Stall", prompt: "A bustling, vibrant farmer's market stall, overflowing with colorful, organic produce. For the 6 variations, capture different market moments: one with early morning light, one surrounded by heirloom tomatoes and leafy greens, one with a customer's hands reaching for produce blurred in the background, and another on a rustic wooden crate." },
            { name: "The Molecular Gastronomy Lab", prompt: "A clean, precise molecular gastronomy lab, where food meets science. The scene is minimalist with stainless steel surfaces and scientific glassware. For the 6 variations, play with the scientific elements: one with dramatic smoke from dry ice, one with colorful liquids in beakers, one with precise plating tweezers in action, and another under a sterile inspection light." },
            { name: "A Smoldering BBQ Pit with Hickory Wood", prompt: "A close-up of a smoldering Texas-style BBQ pit. The scene is rustic and savory, with glowing embers, wisps of hickory smoke, and the dark, textured bark of a brisket. For the 6 variations, capture different moments of the cook: one with intense heat, one focusing on the wood smoke, one with BBQ sauce being brushed on, and another with the finished product." },
            { name: "A High-End Sushi Chef's Counter", prompt: "A minimalist, high-end sushi counter. The scene is one of precision and fresh ingredients, with a skilled chef in the background. The product is on the clean, light wood counter. For the 6 variations, feature different elements: a blowtorch searing fish, a focus on the sharp sushi knife, the vibrant color of tuna, or the steam from fresh rice." },
            { name: "A Swiss Chocolatier's Workshop", prompt: "A decadent Swiss chocolatier's workshop. The scene is rich and artistic, with streams of tempered liquid chocolate, intricate molds, and dusting of cocoa powder. For the 6 variations, explore the artistry: one with flowing liquid chocolate, one focusing on the glossy finish of a finished praline, and one with scattered cocoa nibs and nuts." },
            { name: "A Spanish Tapas Bar", prompt: "A lively and vibrant Spanish tapas bar. The product is on a crowded wooden counter alongside small plates of colorful tapas, glasses of wine, and the blur of happy patrons. For the 6 variations, create different compositions focusing on different tapas, the texture of the wood, and the warm, social atmosphere of the bar." },
            { name: "A Traditional English Pub by the Fire", prompt: "A cozy, traditional English pub on a rainy day. The product is on a dark, polished wooden table next to a pint of ale, with a roaring fireplace in the background. For the 6 variations, capture the cozy mood: one with condensation on the pint glass, one with the flickering firelight reflecting on the product, and one with a view of the rain-streaked windows." },
            { name: "An Open-Air Spice Market in Morocco", prompt: "A sensory explosion in a Moroccan souk. The product is placed among vibrant, cone-shaped piles of spices like turmeric and paprika, with intricate lanterns hanging above. For the 6 variations, focus on different textures and colors of the spices, the play of light through the lanterns, and the busy, blurred motion of the market." }
        ]
    },
    {
        category: "Playful & Whimsical Worlds",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L9.4 8.6 2 10l5.4 6.4L6 22l6-4 6 4-1.4-7.6L22 10l-7.4-1.4Z"/><path d="M2.5 2.5 10 10"/><path d="M14 14l7.5 7.5"/></svg>`,
        locations: [
            { name: "The Enchanted Forest Clearing", prompt: "A magical clearing in an enchanted forest at twilight. The air is filled with sparkling fireflies and the flora has a gentle, magical glow. For the 6 variations, alter the mood and magical elements: one with glowing mushrooms, one with a curious fairy observing from a distance, one next to a sparkling, magical pond, and one with moonbeams breaking through the canopy." },
            { name: "The Candy Land Kingdom", prompt: "A delicious kingdom made entirely of candy and sweets. The landscape features lollipop trees, chocolate rivers, and gingerbread houses. For the 6 variations, explore different parts of the kingdom: one on a gingerbread house porch, one next to a flowing chocolate river, one atop a giant gummy bear, and one on a path of colorful candy canes." },
            { name: "The Miniature Toy Soldier Battlefield", prompt: "A miniature battlefield on a child's bedroom floor, populated by classic green plastic toy soldiers engaged in a dramatic standoff. For the 6 variations, create different scenes: one where the product is a giant, mysterious obstacle, one amidst a cavalry charge of plastic horses, one in the command tent made of pillows, and one being inspected by the toy general." },
            { name: "The Outer Space Cartoon Planet", prompt: "A colorful and friendly cartoon planet in outer space. The planet has goofy, colorful craters, silly-looking rock formations, and a sky with multiple moons and ringed planets. For the 6 variations, show different whimsical views: one with a friendly, googly-eyed alien waving, one with a rocket ship landing nearby, and one showing the curve of the cartoon planet." },
            { name: "A Steampunk Airship Flying Through Clouds", prompt: "On the polished wooden deck of a fantastical steampunk airship. The scene is adventurous, with brass pipes, spinning gears, and a view of fluffy clouds and a setting sun. For the 6 variations, show different aspects of the airship: one near the ship's wheel, one with the giant balloon in the background, and one with a crew member in goggles." },
            { name: "Inside a Giant's Storybook", prompt: "A whimsical scene where the product is placed inside an oversized, open storybook. The pages have giant text and beautiful, classic illustrations, making the product look miniature. For the 6 variations, use different illustrated scenes from the book as the backdrop (a castle, a dragon, a forest) and play with the depth of field." },
            { name: "A World Made of LEGO Bricks", prompt: "A colorful, geometric world constructed entirely from LEGO bricks. The scene is creative, structured, and playful, with LEGO trees, houses, and cars. For the 6 variations, create different LEGO environments: a bustling city street, a calm park, or a futuristic spaceport, all with the characteristic blocky aesthetic." },
            { name: "A City in the Clouds like Bespin", prompt: "A majestic city floating in the clouds at sunset. The product is on an elegant balcony overlooking a cityscape of beautiful, streamlined towers and flying vehicles. For the 6 variations, change the color of the sunset, the design of the flying cars, and the architecture of the towers to create a range of breathtaking, futuristic views." },
            { name: "The World Inside a Snow Globe", prompt: "A magical scene inside a classic snow globe. The product is on a miniature landscape, and artificial snow is gently falling all around it. For the 6 variations, feature different miniature scenes inside the globe (a tiny village, a forest, a castle) and play with the lighting to create a cozy, magical, and nostalgic feel." },
            { name: "A Library Where Books Come to Life", prompt: "An old, magical library where characters and scenes are literally flying out of the open pages of books as shimmering, magical projections. For the 6 variations, showcase different stories coming to life: a dragon flying around the bookshelves, tiny knights having a battle, or a shimmering castle forming in the air, each creating a different whimsical backdrop." }
        ]
    }
];


// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const App = () => {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<'backgrounds' | 'random' | 'custom'>('backgrounds');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatingCategory, setGeneratingCategory] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<{name: string, prompt: string} | null>(null);


  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setProductImage(file);
        setProductImagePreview(URL.createObjectURL(file));
        setGeneratedImages([]);
        setError(null);
        setSelectedStyle(null);
      } else {
        setError('Please upload a valid image file (PNG, JPG, etc.).');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    handleImageUpload(event.dataTransfer.files);
  };

  const handleGenerateClick = useCallback(async (category: string, promptOrPrompts: string | string[], count: number = 6) => {
    if (!productImage || !selectedStyle) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setGeneratingCategory(category);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const reader = new FileReader();
      reader.readAsDataURL(productImage);

      reader.onloadend = async () => {
        const base64ImageData = (reader.result as string).split(',')[1];

        const imagePart = {
          inlineData: {
            data: base64ImageData,
            mimeType: productImage.type,
          },
        };

        const generationPromises = Array(count).fill(0).map((_, index) => {
          const currentPrompt = Array.isArray(promptOrPrompts)
            ? promptOrPrompts[index % promptOrPrompts.length] // Use modulo for safety
            : promptOrPrompts;

          const fullPrompt = `
            **STYLE MANDATE:**
            First, adopt the following artistic style for the entire image: "${selectedStyle.prompt}".

            **SCENE DESCRIPTION:**
            Within that style, create a scene based on this description: "${currentPrompt}".

            **CORE PRINCIPLES (Non-negotiable):**
            - **Product Fidelity:** The original product must remain completely unchanged, preserving all details.
            - **Context:** The product must be placed logically and naturally within the scene.
            - **Quality:** The final image must be of hyper-realistic, professional quality, free of any digital artifacts.
            - **Scale:** The product's scale must be perfectly realistic for the surrounding environment.
            - **Text Sharpness:** Any text or logos on the product must be perfectly sharp, readable, and unaltered.

            **PRIMARY INSTRUCTIONS (Follow these strictly):**
            1.  **Analyze and Understand:** First, analyze the user's product to understand what it is and its key features.
            2.  **Isolate Product:** Perfectly identify and isolate the main product from the user's uploaded image.
            3.  **Discard Background:** Completely REMOVE and DISCARD the original background.
            4.  **Create New Scene:** Generate the new background scene based on the SCENE DESCRIPTION and STYLE MANDATE.
            5.  **Contextual Placement:** Using your understanding of the product, place it in the most logical and natural position within the new scene.
            6.  **Analyze Scale:** Critically analyze the product's real-world size and adjust it to be perfectly proportional and realistic within the new scene.
            7.  **Integrate with Lighting:** Add realistic lighting and shadows to the product so it seamlessly integrates into the new environment.

            **VARIATION INSTRUCTIONS:**
            For this specific generation, create a unique variation focusing on a different camera angle, lighting condition, or composition as suggested in the scene description. The final output must be ${count} distinctly different images based on the same core request.
          `;

          const textPart = { text: fullPrompt };

          return ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
              responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
          });
        });

        const responses = await Promise.all(generationPromises);

        const newImages: string[] = [];
        responses.forEach(response => {
          response.candidates[0].content.parts.forEach((part: Part) => {
            if (part.inlineData) {
              newImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
          });
        });

        if (newImages.length === 0) {
          setError('The AI could not generate images for this request. Please try a different prompt or image.');
        }

        setGeneratedImages(newImages);
      };

    } catch (err) {
      console.error(err);
      setError('An error occurred while generating images. Please try again.');
    } finally {
      setIsLoading(false);
      setGeneratingCategory(null);
    }
  }, [productImage, selectedStyle]);


  const renderInteractionContent = () => {
    switch(generationMode) {
      case 'backgrounds':
        return (
          <section className="backgrounds-section">
            {DETAILED_BACKGROUNDS.map(category => (
              <details key={category.category} className="background-category">
                <summary>
                  {category.category}
                </summary>
                <div className="background-options-grid">
                  {category.locations.map(loc => (
                    <button
                      key={loc.name}
                      className="background-button"
                      onClick={() => handleGenerateClick(loc.name, loc.prompt)}
                      disabled={isLoading}
                    >
                      {isLoading && generatingCategory === loc.name ? (
                        <div className="spinner"></div>
                      ) : (
                        <span className="background-icon" dangerouslySetInnerHTML={{ __html: category.icon }}></span>
                      )}
                      <span className="background-name">{loc.name}</span>
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </section>
        );
      case 'random':
        return (
          <section className="generate-section card">
            <button
              className="generate-button"
              onClick={() => {
                const randomPrompts = shuffleArray(DIVERSE_BACKGROUND_PROMPTS).slice(0, 10);
                handleGenerateClick('Random', randomPrompts, 10);
              }}
              disabled={isLoading}
            >
              {isLoading && generatingCategory === 'Random' ? <div className="spinner"></div> : 'Generate 10 Random Backgrounds'}
            </button>
          </section>
        );
      case 'custom':
        return (
          <section className="custom-prompt-section card">
            <input
              type="text"
              className="prompt-input"
              placeholder="e.g., on a pirate ship's treasure chest"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="generate-button"
              onClick={() => handleGenerateClick('Custom', customPrompt)}
              disabled={isLoading || !customPrompt}
            >
              {isLoading && generatingCategory === 'Custom' ? <div className="spinner"></div> : 'Generate'}
            </button>
          </section>
        );
      default:
        return null;
    }
  };


  return (
    <main>
      <header>
        <h1>Product Background Generator</h1>
        <p>Upload your product image, choose a visual style, and generate stunning, professional backgrounds in seconds.</p>
      </header>

      <section className="upload-section card">
        {!productImagePreview ? (
          <div
            className="upload-area"
            onClick={() => document.getElementById('image-upload')?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
            />
            <p>Drag & drop your image here, or <span>browse files</span>.</p>
          </div>
        ) : (
          <div className="image-preview-wrapper">
            <img src={productImagePreview} alt="Product preview" className="image-preview" />
            <button className="change-image-button" onClick={() => {
              setProductImage(null);
              setProductImagePreview(null);
              setGeneratedImages([]);
              setSelectedStyle(null);
            }}>
              Change Image
            </button>
          </div>
        )}
      </section>

      {productImagePreview && (
         <section className="style-selection-section card">
            <h2>Step 1: Choose a Visual Style</h2>
            <div className="style-grid">
              {VISUAL_STYLES.map(style => (
                <div
                  key={style.name}
                  className={`style-card ${selectedStyle?.name === style.name ? 'selected' : ''}`}
                  onClick={() => setSelectedStyle(style)}
                >
                  <div className="style-card-header">
                    <span className="style-icon" dangerouslySetInnerHTML={{ __html: style.icon }}></span>
                    <h3 className="style-name">{style.name}</h3>
                  </div>
                  <p className="style-description">{style.description}</p>
                </div>
              ))}
            </div>
         </section>
      )}

      {selectedStyle && (
        <section className="interaction-section card">
          <h2>Step 2: Choose a Background</h2>
          <div className="mode-selector">
            <button className={generationMode === 'backgrounds' ? 'active' : ''} onClick={() => setGenerationMode('backgrounds')}>Backgrounds</button>
            <button className={generationMode === 'random' ? 'active' : ''} onClick={() => setGenerationMode('random')}>Random</button>
            <button className={generationMode === 'custom' ? 'active' : ''} onClick={() => setGenerationMode('custom')}>Custom</button>
          </div>
          {renderInteractionContent()}
        </section>
      )}


      {error && <div className="error">{error}</div>}

      {isLoading && !generatedImages.length && (
        <div className="loading card">
          <div className="spinner" style={{borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--primary-color)', width: '40px', height: '40px', margin: '0 auto 1rem auto'}}></div>
          <p>Generating your images... This can take up to a minute.</p>
          <p>The AI is working hard to create the perfect scene!</p>
        </div>
      )}

      {generatedImages.length > 0 && (
        <section className="results-section">
          <h2>Your Generated Backgrounds</h2>
          <div className="results-grid">
            {generatedImages.map((src, index) => (
              <img key={index} src={src} alt={`Generated background ${index + 1}`} className="result-image" style={{ animationDelay: `${index * 100}ms` }} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);