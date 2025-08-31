/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality, Part } from "@google/genai";

declare const JSZip: any;

const MAX_IMAGES = 10;

// --- DATA CONSTANTS ---

const VISUAL_STYLES = [
    { name: 'Hyper Realistic', description: 'Ultra-detailed, photorealistic rendering with lifelike textures and lighting.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L6 7l6 5 6-5-6-5z"/><path d="M6 17l6 5 6-5"/><path d="M6 12l6 5 6-5"/></svg>`, prompt: 'Create a hyper-realistic, high-resolution photograph. Emphasize lifelike textures, natural lighting, and crisp details to the point of being indistinguishable from a real photo.' },
    { name: '3D Claymation', description: 'Charming, handcrafted look with visible fingerprints and soft, rounded shapes.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.7.7a5.4 5.4 0 0 0 0 7.65l.7.7a5.4 5.4 0 0 0 7.65 0l.7-.7a5.4 5.4 0 0 0 0-7.65l-.7-.7z"/><path d="m9 15 1-1"/><path d="m14 10-1 1"/><path d="m11 13 2-2"/><path d="m13 11 2-2"/><path d="m8 12 3-3"/></svg>`, prompt: 'Render the scene in a 3D claymation style. Everything should look handcrafted from modeling clay, with soft, rounded edges, visible fingerprints, and a slightly imperfect, tactile quality.' },
    { name: 'Ghibli-Inspired', description: 'Lush, hand-painted anime style with a sense of wonder and beautiful landscapes.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 16a2.5 2.5 0 0 1 5 0c0 1.4-1.1 2.5-2.5 2.5S2.5 17.4 2.5 16Z"/><path d="M21.5 16a2.5 2.5 0 0 0-5 0c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5Z"/><path d="M7.5 16v-4.5a2.5 2.5 0 0 1 5 0V16"/><path d="M2.5 16h5"/><path d="M16.5 16h5"/><path d="M12.5 11.5a2.5 2.5 0 0 1-5 0V7a5 5 0 0 1 10 0v4.5a2.5 2.5 0 0 1-5 0Z"/></svg>`, prompt: 'Illustrate the scene in a Ghibli-inspired anime style. Use lush, hand-painted watercolor backgrounds, soft lighting, a nostalgic and whimsical atmosphere, and expressive details.' },
    { name: 'Vintage Polaroid', description: 'Faded colors, soft focus, and a classic white border for a nostalgic, retro feel.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M6.5 12.5a2.5 2.5 0 0 1 5 0V15H9v-2.5a2.5 2.5 0 0 1-2.5-2.5V10"/><path d="M15 10h2.5a2.5 2.5 0 0 1 0 5H15v-5Z"/></svg>`, prompt: 'Simulate a vintage Polaroid photograph. Apply a soft focus, faded color palette with a warm yellow tint, light leaks, and a classic instant film border to the final image.' },
    { name: 'Isometric 3D', description: 'Clean, stylized 3D graphics on a floating diorama with a clean, playful aesthetic.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.12 6.4-6.05-4.06a2 2 0 0 0-2.17-.02L2.92 6.42a2 2 0 0 0-1.01 1.75v8.52a2 2 0 0 0 1.13 1.78l6.1 3.94a2 2 0 0 0 2.02 0l6.08-3.94a2 2 0 0 0 1.13-1.78V8.1a2 2 0 0 0-.98-1.7z"/><path d="M12 22V12"/><path d="m22 8-10 7-10-7"/><path d="M12 12 2.92 6.42"/></svg>`, prompt: 'Create a scene as a clean, isometric 3D illustration. The environment should be a small, floating diorama with simplified geometry, a bright color palette, and soft, ambient lighting.' },
    { name: 'Blueprint Schematic', description: 'Technical, monochrome line art on a blue background, as if from an engineer\'s draft.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.28 21.28H2.72V2.72h18.56Z"/><path d="M12 16.27V7.72"/><path d="m16.27 12-8.55 0"/><path d="M12 2.72v18.56"/><path d="M2.72 12h18.56"/><path d="m15.09 15.09-6.18-6.18"/><path d="m15.09 8.91-6.18 6.18"/></svg>`, prompt: 'Generate the image as a technical blueprint schematic. Use white line art with annotations on a deep blue background. The style should be precise, clean, and analytical.' },
];
const CUSTOM_BACKGROUNDS = { 'Aspirational Lifestyle & Home': [{ name: 'The Sun-drenched Scandinavian Loft', prompt: 'A medium shot of the product on a table in a sun-drenched Scandinavian loft. The scene is captured with soft morning light streaming through large windows, creating gentle highlights on the product. Minimalist furniture is artfully blurred in the background.' }, { name: 'The Artisan\'s Workshop', prompt: 'A close-up shot of the product on a workbench in a beautiful, messy artisan\'s workshop. Warm, focused light illuminates the product, with raw materials like wood shavings and neatly hung tools visible in the soft-focus background.' }, { name: 'The \'Golden Hour\' Family Kitchen', prompt: 'A warm, lived-in family kitchen during the \'golden hour\'. The product sits on a stone countertop, with sunlight streaming in from the side to create a beautiful flare. A child\'s drawing on the refrigerator is softly blurred in the background.' }, { name: 'The Zen Reading Nook', prompt: 'A cozy, quiet reading nook. The composition is a tight shot focusing on the product placed next to a stack of books, with the soft glow of a single warm lamp creating a calm, focused mood against a dark wall.' }, { name: 'The Bustling Parisian Café Terrace', prompt: 'A chic Parisian café terrace. The product is the sharp focus on a small, round metal table, with a croissant and coffee nearby. A shallow depth of field blurs the classic architecture and a stylish passerby in the background.' }, { name: 'The Modern Rooftop Terrace Garden', prompt: 'A modern urban rooftop terrace garden at dusk. The shot focuses on the product, with the warm glow of string lights creating beautiful bokeh from the blurred city skyline behind it.' }, { name: 'The Cozy Log Cabin by the Fireplace', prompt: 'A cozy log cabin interior. The product is on a sheepskin rug, with the warm, flickering light from a roaring fireplace casting a gentle glow on it. Snow is visible falling outside the window in the background.' }, { name: 'The Minimalist Japanese Tea Room', prompt: 'A serene and minimalist Japanese tea room. The scene is a low-angle shot from the tatami mat flooring, making the product look elegant. Dramatic shadows are cast by the shoji screen walls.' }, { name: 'The Collector\'s Library', prompt: 'A dark academia-themed collector\'s library. The shot is a low angle looking up at the product placed on a ledge, making the floor-to-ceiling bookshelves seem towering and grand in the background.' }, { name: 'The Bohemian Balcony Garden', prompt: 'A lush bohemian balcony garden at twilight. The shot focuses on the product, with the magical glow of fairy lights woven through hanging plants creating a soft, dreamy background.' }, { name: 'The Grand Piano in a Sunroom', prompt: 'A polished black grand piano in a bright sunroom. The shot focuses on the reflection of the product on the piano\'s pristine surface, with dramatic shadows cast by elegant indoor trees.' }], 'Professional & Commercial Environments': [{ name: 'The Collaborative Tech Start-up Hub', prompt: 'An innovative tech start-up hub. The product is in sharp focus on a desk, while the glass walls behind it reflect the city view. Developers are blurred in the background, working on whiteboards.' }, { name: 'The High-Fashion Retail Boutique', prompt: 'A minimalist, luxurious retail boutique. The product is displayed on a marble pedestal, lit by a single, dramatic, focused spotlight that makes it the sole hero of the shot. The concrete wall behind is in shadow.' }, { name: 'The Serene Wellness Spa', prompt: 'A serene wellness spa. The product is placed next to neatly stacked hot stones and a single orchid, bathed in soft, diffused, tranquil light. The natural stone and bamboo background is softly out of focus.' }, { name: 'The Architect\'s Drafting Table at Night', prompt: 'An architect\'s drafting table at night. A single desk lamp illuminates a close-up of the product\'s sharp lines next to precise rulers on a blueprint, creating a stark, high-contrast scene.' }, { name: 'The Bustling Stock Exchange Trading Floor', prompt: 'An energetic stock exchange trading floor. The shot uses a shallow depth of field, keeping the product in crisp focus while a glowing red stock chart on a screen is artistically blurred in the background.' }, { name: 'The Michelin-Star Restaurant Kitchen', prompt: 'The heart of a Michelin-star restaurant kitchen. The scene focuses on a chef\'s hands delicately plating a dish, with the product placed in the immediate foreground, in sharp focus, on a stainless steel surface.' }, { name: 'The University Lecture Hall', prompt: 'A grand, classic university lecture hall. The scene is captured with \'golden hour\' light streaming through arched windows, illuminating the product on a rich, old wooden desk and creating long shadows.' }, { name: 'The Executive Boardroom on the Top Floor', prompt: 'A sleek, modern executive boardroom at night. The product sits on a massive polished glass table, perfectly reflecting the panoramic city lights from the floor-to-ceiling windows behind it.' }, { name: 'The Scientist\'s Cleanroom Laboratory', prompt: 'A sterile, brightly lit scientist\'s cleanroom laboratory. The product is the central focus, while in the background, a scientist in a full protective suit and glowing liquids in vials are blurred.' }, { name: 'The Luxury Hotel Lobby', prompt: 'The opulent lobby of a luxury hotel. The shot is a low angle looking up past the product, focusing on the intricate, sparkling details of a massive crystal chandelier above.' }], 'Rugged & Natural Settings': [{ name: 'The Misty Redwood Forest Floor', prompt: 'The floor of a misty redwood forest. The product rests on a bed of rich moss, with dappled light breaking through the foggy canopy to create beautiful, natural spotlights on it.' }, { name: 'The Volcanic Black Sand Beach at Dusk', prompt: 'A dramatic volcanic black sand beach at dusk. The shot is a low-angle view, capturing the high contrast of waves crashing and sending white seafoam over the dark, wet sand that reflects the purple sky.' }, { name: 'The Himalayan Mountain Basecamp', prompt: 'A Himalayan mountain basecamp. The product is situated on a rocky ledge, with sharp, clear sunlight creating high contrast and wind-blown snow conveying a sense of extreme performance.' }, { name: 'The Joshua Tree Desertscape at Sunrise', prompt: 'A Joshua Tree desertscape at sunrise. The product sits on a warm, weathered rock, with the low sun creating a long shadow from a distinctive Joshua Tree against a soft pink sky.' }, { name: 'The Amazon Rainforest Canopy Walkway', prompt: 'High on a canopy walkway in the Amazon rainforest. The scene uses a shallow depth of field, keeping the product sharp while a colorful toucan is visible in the blurred, densely green background.' }, { name: 'The Salt Flats at Midday', prompt: 'A vast, minimalist salt flat landscape. The shot emphasizes the immense sense of scale, with the product casting a single, harsh shadow on the perfectly flat, white expanse under a deep blue sky.' }, { name: 'The Underwater Coral Reef', prompt: 'A vibrant, serene underwater coral reef. The shot captures shimmering shafts of sunlight filtering through the clear blue water, illuminating the product on a patch of sand as a sea turtle swims by in the background.' }, { name: 'The Geothermal Hot Spring in Iceland', prompt: 'On a dark volcanic rock beside a steaming geothermal hot spring. The scene captures thick, moody steam partially obscuring the snow-dusted lava fields in the background, creating a sense of mystery.' }, { name: 'The African Savannah at Sunset', prompt: 'On a termite mound in the vast, golden African savannah. The scene is a dramatic silhouette shot, with the product and a herd of elephants in the distant background against a fiery sunset.' }, { name: 'The Inside of a Crystal Ice Cave', prompt: 'Inside a glowing, crystal-clear ice cave. The shot focuses on the surreal, magical glow as sunlight from outside makes the deep, translucent blue walls shimmer and create beautiful refraction patterns.' }], 'Abstract & Conceptual Studios': [{ name: 'The Monochromatic Color-Drenched Room', prompt: 'A monochromatic room saturated in Yves Klein Blue. The product is the only object, casting a single, hard shadow under a dramatic spotlight, emphasizing its form.' }, { name: 'The Bauhaus Geometric Studio', prompt: 'A studio of overlapping geometric shapes in primary colors. The shot is a balanced, abstract composition that integrates the product\'s shape with the graphic forms.' }, { name: 'The Polished Concrete & Lush Moss Gallery', prompt: 'A macro shot exploring the juxtaposition of textures, focusing on the intersection where the product touches both a cold, grey concrete slab and a vibrant, soft patch of green moss.' }, { name: 'The Surreal Floating Islands-cape', prompt: 'A dreamlike scene where the product rests on a small, grass-covered island floating in a soft, cloud-filled sky at sunrise, creating a whimsical and serene mood.' }, { name: 'The Infinity Mirror Room', prompt: 'An infinity mirror room with blue and gold lights. The camera angle creates a mind-bending, endless geometric pattern from the product\'s reflections.' }, { name: 'The Suspended Silk Fabric Installation', prompt: 'A soft, ethereal environment where the product is nestled within large, flowing swathes of dusty rose silk fabric, with soft, diffused lighting creating a gentle, dreamy mood.' }, { name: 'The Shattered Glass & Light Studio', prompt: 'A dramatic, high-contrast studio where the product sits amongst sharp shards of a shattered mirror. A single beam of light creates a dramatic lens flare and glints off the sharp edges.' }, { name: 'The Liquid Metal Sculpture Studio', prompt: 'A high-contrast studio where the product is surrounded by flowing shapes of liquid gold, frozen mid-splash. Its reflection is clearly visible on the specular surface.' }, { name: 'The Room of Floating Geometric Prisms', prompt: 'A minimalist white room where a single beam of light passes through dozens of floating, translucent prisms, casting vibrant rainbow patterns and caustic effects directly onto the product.' }, { name: 'The Sand Dune & Shadow Play Room', prompt: 'A studio filled with fine, white sand sculpted into sensuous dunes. A single, harsh light source creates a long, dramatic, and sharp-edged abstract shadow pattern across the landscape, with the product at the focal point.' }], 'Futuristic & Sci-Fi Scenarios': [{ name: 'The Sleek Mars Colony Habitation Pod', prompt: 'The interior of a sleek Mars colony pod. The shot looks out a window at the red Martian landscape, while a complex holographic star chart glows next to the product, illuminating it.' }, { name: 'The Neon-Soaked Cyberpunk Alleyway', prompt: 'A wet, reflective cyberpunk alleyway. The scene is lit by bright pink and blue neon signs in Korean, with steam rising from a vent and reflecting on the wet ground around the product.' }, { name: 'The \'Solarpunk\' Rooftop Garden', prompt: 'A utopian \'Solarpunk\' rooftop garden. The shot shows the product surrounded by lush vertical gardens, with a clean, futuristic vehicle flying silently in the bright sky above.' }, { name: 'The Zero-Gravity Space Station Hub', prompt: 'The interior of a zero-gravity space station hub. The product floats weightlessly in the foreground, with small, spherical water droplets suspended nearby, in front of a large window showing a stunning view of Earth.' }, { name: 'The Bioluminescent Alien Jungle', prompt: 'A mysterious alien jungle at night. The scene is lit by the mysterious, bioluminescent blue and purple glow of exotic, strange and beautiful plants and fungi surrounding the product.' }, { name: 'The Sleek Hyperloop Train Interior', prompt: 'The minimalist interior of a Hyperloop train. The shot shows the blurred landscape rushing past the window, emphasizing speed, while the product sits in the calm, sleek interior.' }, { name: 'The Genetic Engineering Laboratory', prompt: 'A high-tech genetic engineering laboratory. The scene is clean and futuristic, with a massive, glowing DNA helix projected in the air behind the product, creating a sense of advanced science.' }, { name: 'The Command Bridge of a Starship', prompt: 'On the command console of a starship bridge. The shot overlooks a massive viewscreen showing a swirling, colorful nebula, with the ship\'s low lighting focused on the control panels and the product.' }, { name: 'The Underwater City of Atlantis', prompt: 'A futuristic underwater city. The view is from a balcony inside a glass dome, as a majestic, whale-like creature swims past the glowing architecture in the distance behind the product.' }], 'Historical & Vintage Eras': [{ name: 'The Art Deco Speakeasy Bar', prompt: 'A hidden, opulent Art Deco speakeasy bar. The scene features the product next to a classic cocktail glass, with wisps of cigar smoke catching the low, warm light.' }, { name: 'The 1960s California Case Study House', prompt: 'An iconic Mid-Century Modern house. The scene shows the product on a table next to a classic Eames lounge chair, with a sun-drenched patio and pool visible through floor-to-ceiling glass.' }, { name: 'The Victorian Explorer\'s Study', prompt: 'A Victorian explorer\'s study. The product is placed on a dark mahogany desk next to a brass globe and a magnifying glass, with hand-drawn maps in the background.' }, { name: 'The 1980s Neon and Chrome Arcade', prompt: 'A dark 1980s arcade. The shot focuses on the product reflecting the neon lights of a classic arcade cabinet, with game graphics visible on the screen.' }, { name: 'The Ancient Roman Villa Courtyard', prompt: 'The courtyard of a sunlit ancient Roman villa. The scene is captured with harsh midday sun creating sharp shadows from columns across a mosaic floor, with a marble fountain in the background.' }, { name: 'The Roaring 50s American Diner', prompt: 'A classic 50s American diner. The product is on a chrome-edged counter next to a tall milkshake, reflecting the glow of the red neon signs.' }, { name: 'The Elizabethan Theatre Stage', prompt: 'The wooden stage of an Elizabethan theatre. The scene is dramatic, with the product captured in a single spotlight against a backdrop of rich, heavy curtains.' }, { name: 'The Wild West Saloon', prompt: 'On a polished wooden bar in a classic Wild West saloon. The shot captures the silhouette of a cowboy in the swinging doors in the background, with the scene lit by low, warm oil lamps.' }, { name: 'An Ancient Egyptian Pharaoh\'s Tomb', prompt: 'Inside a newly discovered pharaoh\'s tomb. The product is among golden artifacts, with the dramatic, flickering light of an explorer\'s torch illuminating a nearby sarcophagus.' }, { name: 'The 1970s Disco Dance Floor', prompt: 'At the center of a vibrant 1970s disco dance floor. The shot is a long exposure, showing colorful motion trails from dancers around the product, which is illuminated by a spinning disco ball.' }], 'High-Energy & Motion': [{ name: 'The Urban Skatepark at Magic Hour', prompt: 'An urban skatepark at magic hour. The shot captures a skater blurred in motion mid-air in the background, with the product in sharp focus against graffiti-covered concrete.' }, { name: 'The Professional E-Sports Arena Stage', prompt: 'The massive stage of a professional e-sports arena. The product is under intense blue and purple spotlights, with atmospheric haze and gameplay graphics visible on giant LED screens.' }, { name: 'The Rain-Slicked Formula 1 Pit Lane', prompt: 'A rain-slicked Formula 1 pit lane. The shot captures a car speeding past with motion blur, as mechanics move in a flurry of controlled chaos and sparks fly.' }, { name: 'The Backstage of a Rock Music Festival', prompt: 'A candid, behind-the-scenes moment backstage at a rock music festival. The product is on a roadie case amidst a tangle of cables, with the bright stage lights spilling in.' }, { name: 'The Professional Boxing Ring Under Lights', prompt: 'A professional boxing ring. The shot is a dramatic low angle from the canvas, looking up at the product under a single, harsh spotlight in a dark, hazy arena.' }, { name: 'A World Cup Ski Slalom Course', prompt: 'A World Cup ski slalom course. The shot captures a skater blurred in high-speed motion, spraying a plume of snow into the air as they pass a gate next to the product.' }, { name: 'A Dirt Bike Rally in the Desert', prompt: 'A desert dirt bike rally. The shot captures a bike kicking up a massive plume of dust against a dramatic setting sun, with the product on a rock in the foreground.' }, { name: 'The Crest of a Surfing Wave', prompt: 'Conceptually captured on the crest of a massive, curling surfing wave at sunset. The scene is dynamic, with spray flying and the water a brilliant, translucent orange and blue.' }, { name: 'A Parkour Free-runner\'s Rooftop Leap', prompt: 'Captured mid-moment with a dramatic lens flare from the sun as a parkour athlete leaps between two skyscrapers, with the city below as a dizzying, motion-blurred view.' }, { name: 'The Eye of a Tornado', prompt: 'A dramatic, conceptual scene from the surprisingly calm eye of a massive tornado. The product sits on the ground as the vortex walls swirl with dust and the debris of a farmhouse.' }], 'Macro & Texture Focus': [{ name: 'A Drop of Morning Dew on a Spider\'s Web', prompt: 'An extreme macro shot of a perfect spherical drop of morning dew on an intricate spider\'s web, refracting the golden morning light.' }, { name: 'Sunlight Through a Glass of Iced Hibiscus Tea', prompt: 'A sensory macro shot focusing on the condensation dripping down a glass of glowing, crimson-colored iced hibiscus tea, with a mint leaf garnish.' }, { name: 'The Close-up Weave of Raw Selvedge Denim', prompt: 'A macro view of the thick, indigo-dyed cotton threads of raw selvedge denim, with the lighting highlighting the texture and the contrast of the orange stitching.' }, { name: 'Molten Glass Being Shaped by an Artisan', prompt: 'A conceptual shot capturing the intense, glowing heat and transformation as an artisan\'s tools shape a semi-liquid orb of molten glass.' }, { name: 'The Frost Patterns on a Window Pane', prompt: 'An extreme close-up of delicate, crystalline frost patterns on a window pane, with the soft morning light filtering through to create a cold, beautiful scene.' }, { name: 'Bubbles Rising in a Glass of Champagne', prompt: 'A luxurious macro shot of effervescent bubbles rising in a crystal glass, with golden light refracting through the champagne.' }, { name: 'The Polished Grain of a Rare Wood Burl', prompt: 'A macro view of the intricate, polished grain of a rare wood burl, with lighting that highlights the rich colors and swirling patterns of the natural texture.' }, { name: 'The Surface of a Geode Crystal', prompt: 'An extreme close-up on the glittering, crystalline surface inside a split-open amethyst geode, with the light creating sparkling refractions off the tiny, purple facets.' }, { name: 'The Oiled Feathers of a Peacock', prompt: 'A macro shot focusing on the iridescent \'eye\' of a peacock\'s feather, with the lighting angle highlighting the shimmering blue, green, and gold colors.' }, { name: 'The Cracking Surface of Dried Earth', prompt: 'A close-up of the geometric, cracked patterns of a dried-up riverbed, with a tiny green sprout emerging from one crack, lit by the morning sun.' }], 'Cultural & Festive Gatherings': [{ name: 'A Mediterranean Alfresco Dinner Party', prompt: 'A Mediterranean alfresco dinner party. The shot is a close-up of hands reaching for fresh bread on a long wooden table, with string lights and blurred figures in the background.' }, { name: 'A Lantern-Lit Night Market in Southeast Asia', prompt: 'A vibrant night market in Southeast Asia. The shot focuses on the warm glow of lanterns on the product, with the vibrant colors of spices and the blur of the crowd in the background.' }, { name: 'A Traditional Japanese Tea Ceremony', prompt: 'A traditional Japanese tea ceremony. The shot focuses on the steam rising from a handcrafted ceramic tea bowl, with the texture of the tatami mat and the grain of the wood visible.' }, { name: 'The Colorful Dia de los Muertos Ofrenda', prompt: 'A brightly decorated Dia de los Muertos ofrenda. The shot is a close-up, focusing on the product surrounded by marigold flowers and the soft, flickering light of candles.' }, { name: 'The Rio Carnival Parade Float', prompt: 'A vibrant float in the Rio Carnival parade. The shot captures the energy with confetti frozen in the air around the product, with a backdrop of colorful feathers and bright parade lights.' }, { name: 'A Holi Festival Celebration in India', prompt: 'The heart of a Holi festival celebration. The scene is joyful and chaotic, with vibrant yellow and pink powders exploding in the air around the clean product.' }, { name: 'A Classic English Garden Tea Party', prompt: 'An elegant English garden tea party. The shot focuses on the product next to a delicate teacup on a lace tablecloth, with a beautiful blooming rose garden in the soft-focus background.' }, { name: 'The Running of the Bulls in Pamplona', prompt: 'A scene from the Running of the Bulls. The shot is a dramatic low angle from a safe balcony, showing the product overlooking the narrow street and the red scarves of the runners below.' }, { name: 'The Yi Peng Lantern Festival in Thailand', prompt: 'A magical night at the Yi Peng Lantern Festival. The shot focuses on the reflection of thousands of glowing paper lanterns in the river, with the product on a platform.' }, { name: 'A Venetian Masquerade Ball', prompt: 'An opulent and mysterious Venetian masquerade ball. The shot focuses on the intricate detail of a mysterious mask, with the product on a velvet-draped table and blurred dancers in the background.' }], 'Underground & Subculture Scenes': [{ name: 'A Berlin Underground Warehouse Rave', prompt: 'A vast, industrial Berlin warehouse rave. The shot captures the product with a dramatic lens flare from a single laser beam cutting through artificial fog and silhouetted dancers.' }, { name: 'A Secret Library in a Gothic Cathedral', prompt: 'A secret, vaulted library in a gothic cathedral. The shot captures dramatic beams of colored light streaming from a single stained-glass window onto the ancient, leather-bound books.' }, { name: 'A DIY Punk Show in a Basement', prompt: 'A cramped, low-ceilinged basement during a DIY punk show. The shot is a gritty, candid moment, capturing the motion blur of the crowd under a single bare lightbulb.' }, { name: 'The Artist\'s Loft After a Painting Session', prompt: 'A chaotic artist\'s loft after a painting session. The shot is a close-up of colorful paint drips on the floor, with the product sitting on a stool having a few stray drops of paint.' }, { name: 'A Tattoo Artist\'s Studio at Night', prompt: 'A tattoo artist\'s studio late at night. The shot focuses on the gleam of the tattoo machine and the vibrant colors of ink bottles, with flash art on the walls in the background.' }, { name: 'An Abandoned Subway Station Graffiti Gallery', prompt: 'An abandoned subway station. The shot captures the product against a vibrant, high-concept graffiti piece, with dramatic light shafts coming from grates above.' }, { name: 'A Spearfishing Trip in a Cenote', prompt: 'An adventurous scene in a mysterious, underwater cenote. The shot captures a spearfisher as a dark silhouette in the water below, with beautiful beams of light piercing the crystal-clear water.' }, { name: 'An Urban Explorer\'s Derelict Theatre', prompt: 'Inside a beautiful, decaying abandoned theatre. The shot captures dust motes dancing in a single shaft of light that illuminates the product on the otherwise dark stage.' }, { name: 'A Hacker\'s Code-Filled Lair', prompt: 'A dark room lit only by multiple monitors. The shot focuses on the reflection of cascading green computer code on the product\'s surface, with a tangle of wires on the desk.' }, { name: 'A Collector\'s Secret Vinyl Record Room', prompt: 'A small, sound-proofed room lined with records. The shot is a moody close-up of the product on a turntable, focusing on the texture of the record\'s grooves and a glowing amplifier tube.' }], 'Gourmet & Culinary Scenes': [{ name: 'The Rustic Italian Trattoria Kitchen', prompt: 'A rustic Italian trattoria kitchen. The product is on a wooden cutting board dusted with flour, next to fresh pasta being rolled out and hanging garlic and herbs in the background.' }, { name: 'The Modern Patisserie Counter', prompt: 'The pristine counter of a French patisserie. The shot is sharp on the product, with rows of colorful and intricate pastries blurred beautifully under clean glass in the background.' }, { name: 'The Bustling Farmer\'s Market Stall', prompt: 'A bustling farmer\'s market stall. The scene is captured in the early morning light, with the product surrounded by a vibrant arrangement of heirloom tomatoes and leafy greens.' }, { name: 'The Molecular Gastronomy Lab', prompt: 'A clean, precise molecular gastronomy lab. The shot captures dramatic smoke from dry ice billowing around the product on a minimalist stainless steel surface.' }, { name: 'A Smoldering BBQ Pit with Hickory Wood', prompt: 'A close-up of a smoldering Texas-style BBQ pit. The shot focuses on the glowing embers and wisps of hickory smoke rising around the product.' }, { name: 'A High-End Sushi Chef\'s Counter', prompt: 'A minimalist, high-end sushi counter. The shot captures a chef\'s blowtorch searing a piece of fish, with the product sitting cleanly on the light wood counter.' }, { name: 'A Swiss Chocolatier\'s Workshop', prompt: 'A decadent Swiss chocolatier\'s workshop. The artistic shot captures a stream of tempered liquid chocolate flowing near the product, with scattered cocoa nibs on the counter.' }, { name: 'A Spanish Tapas Bar', prompt: 'A lively Spanish tapas bar. The shot captures the warm, social atmosphere with the product on a crowded wooden counter alongside a small plate of colorful tapas and a glass of wine.' }, { name: 'A Traditional English Pub by the Fire', prompt: 'A cozy, traditional English pub on a rainy day. The shot captures the flickering firelight reflecting on the product, which sits next to a pint of ale with condensation.' }, { name: 'An Open-Air Spice Market in Morocco', prompt: 'A sensory explosion in a Moroccan souk. The shot focuses on the vibrant textures and colors of cone-shaped piles of turmeric and paprika next to the product.' }], 'Playful & Whimsical Worlds': [{ name: 'The Enchanted Forest Clearing', prompt: 'A magical clearing in an enchanted forest at twilight. The scene is filled with sparkling fireflies, with the product placed next to a cluster of gently glowing mushrooms.' }, { name: 'The Candy Land Kingdom', prompt: 'A delicious kingdom made of candy. The shot places the product next to a flowing chocolate river, with lollipop trees and gingerbread houses in the background.' }, { name: 'The Miniature Toy Soldier Battlefield', prompt: 'A miniature battlefield on a child\'s bedroom floor. The shot shows the product as a giant, mysterious obstacle that a cavalry charge of plastic toy soldiers is navigating around.' }, { name: 'The Outer Space Cartoon Planet', prompt: 'A colorful and friendly cartoon planet. The shot shows a friendly, googly-eyed alien waving from behind a goofy, colorful crater next to the product.' }, { name: 'A Steampunk Airship Flying Through Clouds', prompt: 'On the polished wooden deck of a fantastical steampunk airship. The shot is from behind the ship\'s wheel, with spinning brass gears and a view of fluffy clouds at sunset.' }, { name: 'Inside a Giant\'s Storybook', prompt: 'A whimsical scene where the product is placed inside an oversized, open storybook. The backdrop is a beautiful, classic illustration of a dragon, making the product look miniature.' }, { name: 'A World Made of LEGO Bricks', prompt: 'A colorful, geometric world constructed entirely from LEGO bricks. The scene is a bustling LEGO city street, with the product placed in a creative and playful composition.' }, { name: 'A City in the Clouds like Bespin', prompt: 'A majestic city floating in the clouds at sunset. The product is on an elegant balcony overlooking a cityscape of beautiful towers, with the sunset in shades of orange and purple.' }, { name: 'The World Inside a Snow Globe', prompt: 'A magical scene inside a classic snow globe. The product is on a miniature snowy village landscape, with artificial snow gently falling around it, creating a cozy feel.' }, { name: 'A Library Where Books Come to Life', prompt: 'An old, magical library. The shot captures a shimmering, magical dragon projection flying out of an open book and circling the bookshelves high above the product.' }], };
const PHOTOGRAPHIC_DIRECTIONS = { 'Camera Angle': [{ name: 'Eye-Level', prompt: 'An eye-level shot' }, { name: 'Low Angle', prompt: 'A dramatic low-angle shot' }, { name: 'High Angle', prompt: 'A high-angle shot looking down' }, { name: 'Dutch Angle', prompt: 'A dynamic dutch-angle shot' }, { name: 'Bird\'s-Eye View', prompt: 'A bird\'s-eye view looking straight down at the product' }, { name: 'Worm\'s-Eye View', prompt: 'A worm\'s-eye view, looking up from the ground' }], 'Shot Type': [{ name: 'Extreme Wide', prompt: 'An extreme wide shot showing the product within the vast landscape' }, { name: 'Wide Shot', prompt: 'A wide shot of the product' }, { name: 'Medium Shot', prompt: 'A medium shot of the product' }, { name: 'Close-Up', prompt: 'A close-up shot focusing on' }, { name: 'Macro Shot', prompt: 'An extreme macro shot of the product\'s texture' }, { name: 'POV', prompt: 'A point-of-view shot, as if the user is holding' }, { name: 'Over-the-Shoulder', prompt: 'An over-the-shoulder shot looking towards the product' }], 'Lighting': [{ name: 'Soft, Diffused', prompt: 'bathed in soft, diffused window light.' }, { name: 'Hard, Direct', prompt: 'lit by a single source of hard, direct light, creating dramatic shadows.' }, { name: 'Golden Hour', prompt: 'captured during the golden hour, with warm, long shadows.' }, { name: 'Blue Hour', prompt: 'captured during the blue hour, with a cool, moody atmosphere.' }, { name: 'Three-Point', prompt: 'using professional three-point studio lighting.' }, { name: 'Rim Lighting', prompt: 'dramatically backlit, creating a bright rim of light around the product\'s silhouette.' }, { name: 'Neon', prompt: 'illuminated by the vibrant glow of pink and blue neon signs.' }, { name: 'Caustic', prompt: 'with shimmering caustic light patterns reflecting on the scene.' }], 'Composition': [{ name: 'Rule of Thirds', prompt: 'A composition using the rule of thirds, placing the product on the right' }, { name: 'Symmetrical', prompt: 'A perfectly centered and symmetrical composition' }, { name: 'Leading Lines', prompt: 'using the road as a leading line to guide the eye to the product.' }, { name: 'Framing', prompt: 'framed by out-of-focus leaves in the foreground.' }, { name: 'Negative Space', prompt: 'A minimalist composition with a large area of negative space around the product' }, { name: 'Golden Ratio', prompt: 'composed along a golden ratio spiral, leading the eye to the product.' }, { name: 'Layers', prompt: 'A composition with deep layers, showing foreground elements, the product in the middle-ground, and a distant background.' }], 'Focus': [{ name: 'Deep Depth of Field', prompt: 'shot with a deep depth of field, keeping the entire scene in sharp focus.' }, { name: 'Shallow Depth of Field', prompt: 'shot with a very shallow depth of field, creating a beautifully blurred background.' }, { name: 'Rack Focus', prompt: 'with the focus pulling from the background to the product in the foreground.' }, { name: 'Tilt-Shift', prompt: 'shot with a tilt-shift effect, making the scene look like a miniature model.' }, { name: 'Soft Focus', prompt: 'a dreamy, soft-focus effect applied to the entire image.' }, { name: 'Lens Flare', prompt: 'with a dramatic, cinematic lens flare from the sun.' }], };
const EDIT_PRESETS = {
  Lighting: [ "Golden Hour", "Studio Lighting", "Neon Glow", "Cinematic Lighting" ],
  "Time of Day": [ "Sunrise", "Midday Sun", "Sunset", "Night Time" ],
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TYPE DEFINITIONS ---

type DirectionCategory = keyof typeof PHOTOGRAPHIC_DIRECTIONS;
type VisualStyle = (typeof VISUAL_STYLES)[number];

interface ProductImage {
  id: string;
  originalName: string;
  data: string;
  mimeType: string;
  processedData?: string;
  isProcessed?: boolean;
  palette?: string[];
}

interface SelectedBackground {
  id: string;
  name: string;
  prompt: string;
  count: number;
  directions: { [key in DirectionCategory]?: string | null };
  matchPalette: boolean;
  negativePrompt: string;
}

interface GeneratedImage {
  id: string;
  sourceId: string; // ID of the product image it was generated from
  data: string;
  mimeType: string;
  prompt: string;
}

interface Preset {
  name: string;
  style: VisualStyle | null;
  backgrounds: SelectedBackground[];
}

interface HistoryEntry {
  id: string;
  date: string;
  previewSrc: string;
  imageCount: number;
  jobData: {
    productImages: ProductImage[];
    selectedStyle: VisualStyle | null;
    selectedBackgrounds: SelectedBackground[];
    generatedImages: GeneratedImage[];
  };
}

const StepIndicator: React.FC<{
  step: number;
  title: string;
  active: boolean;
  children?: React.ReactNode;
}> = ({ step, title, active, children }) => (
  <div className={`step-indicator ${active ? 'active' : ''}`}>
    <div className="step-indicator-content">
      <div className="step-number">{step}</div>
      <h2 className="step-title">{title}</h2>
    </div>
    {children && <div className="step-indicator-actions">{children}</div>}
  </div>
);

// --- MAIN APP COMPONENT ---

const App = () => {
  // Core State
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle | null>(null);
  const [selectedBackgrounds, setSelectedBackgrounds] = useState<SelectedBackground[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // UI/Interaction State
  const [currentStep, setCurrentStep] = useState(1);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [expandedReviewItem, setExpandedReviewItem] = useState<string | null>(null);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);

  // Loading State
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [upscalingId, setUpscalingId] = useState<string | null>(null);
  const [variationsLoadingId, setVariationsLoadingId] = useState<string | null>(null);
  const [isReimagining, setIsReimagining] = useState(false);
  
  // Advanced Features State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [reimaginePrompt, setReimaginePrompt] = useState("");
  const [imageAdjustments, setImageAdjustments] = useState({ brightness: 100, contrast: 100, saturation: 100 });

  // Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const uuid = () => self.crypto.randomUUID();

  // --- LOCAL STORAGE EFFECTS ---

  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('productGenPresets');
      if (savedPresets) setPresets(JSON.parse(savedPresets));
      const savedHistory = localStorage.getItem('productGenHistory');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  // --- HELPER & UTILITY FUNCTIONS ---

  const resizeImage = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const maxSize = 1024;
                if (width > height) {
                    if (width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; }
                } else {
                    if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL(file.type);
                const base64String = dataUrl.split(',')[1];
                resolve({ data: base64String, mimeType: file.type });
            };
            img.onerror = (error) => reject(new Error("Failed to load image for resizing."));
        };
        reader.onerror = (error) => reject(new Error("Failed to read file."));
    });
  };

  const extractColorPalette = (base64Data: string, mimeType: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = `data:${mimeType};base64,${base64Data}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve([]);
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
        const colorCount: { [key: string]: number } = {};
        
        for (let i = 0; i < imageData.length; i += 4 * 100) { 
          const r_q = Math.round(imageData[i] / 32) * 32;
          const g_q = Math.round(imageData[i + 1] / 32) * 32;
          const b_q = Math.round(imageData[i + 2] / 32) * 32;
          if (r_q + g_q + b_q < 700 && r_q + g_q + b_q > 50) {
             const rgb = `${r_q},${g_q},${b_q}`;
             colorCount[rgb] = (colorCount[rgb] || 0) + 1;
          }
        }
        
        const sortedColors = Object.keys(colorCount).sort((a, b) => colorCount[b] - colorCount[a]);
        const palette = sortedColors.slice(0, 5).map(rgb => `rgb(${rgb})`);
        resolve(palette);
      };
      img.onerror = () => resolve([]);
    });
  };

  // --- EVENT HANDLERS ---

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
        const newImages: ProductImage[] = [];
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;
            const resized = await resizeImage(file);
            const palette = await extractColorPalette(resized.data, resized.mimeType);
            newImages.push({ id: uuid(), originalName: file.name, ...resized, isProcessed: false, palette });
        }
        setProductImages(prev => [...prev, ...newImages]);
        setCurrentStep(2);
    } catch (e: any) {
        console.error("Image processing failed:", e);
        setError(e.message || "Failed to process one or more images.");
    } finally {
        setIsUploading(false);
        event.target.value = '';
    }
  };
  
  const handleRemoveProductImage = (id: string) => {
      setProductImages(prev => prev.filter(p => p.id !== id));
  };

  const handleRemoveBackground = async (image: ProductImage) => {
    setIsRemovingBackground(image.id);
    setError(null);
    try {
      const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
      const textPart = { text: "Expertly remove the background of this image, leaving only the main product centered with a transparent background." };
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });
      const newImagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

      if (newImagePart?.inlineData) {
        setProductImages(prev => prev.map(p => p.id === image.id ? { ...p, processedData: newImagePart.inlineData.data, isProcessed: true } : p));
      } else {
        throw new Error("The model did not return an image after background removal.");
      }
    } catch (e: any) {
      console.error(e);
      setError(`Failed to remove background for ${image.originalName}. You can skip this step or try another image.`);
    } finally {
      setIsRemovingBackground(null);
    }
  };

  const handleSkipBackgroundRemoval = (id: string) => {
    setProductImages(prev => prev.map(p => p.id === id ? { ...p, processedData: p.data, isProcessed: true } : p));
  };
  
  const areAllProductsProcessed = productImages.length > 0 && productImages.every(p => p.isProcessed);

  useEffect(() => {
    if (productImages.length > 0 && currentStep < 2) setCurrentStep(2);
    if (areAllProductsProcessed && currentStep < 3) setCurrentStep(3);
    if (selectedStyle && currentStep < 4) setCurrentStep(4);
    if (selectedBackgrounds.length > 0 && currentStep < 5) setCurrentStep(5);
  }, [productImages, areAllProductsProcessed, selectedStyle, selectedBackgrounds.length, currentStep]);

  const handleBackgroundSelect = (name: string, prompt: string) => {
    setSelectedBackgrounds(prev => {
      if (prev.some(bg => bg.prompt === prompt)) {
        return prev.filter(p => p.prompt !== prompt);
      } else {
        return [...prev, { id: uuid(), name, prompt, count: 1, directions: {}, matchPalette: false, negativePrompt: '' }];
      }
    });
  };
  
  const handleAddCustomPrompt = () => {
    if (customPrompt && !selectedBackgrounds.some(bg => bg.prompt === customPrompt)) {
      setSelectedBackgrounds(prev => [...prev, { id: uuid(), name: customPrompt, prompt: customPrompt, count: 1, directions: {}, matchPalette: false, negativePrompt: '' }]);
      setCustomPrompt('');
    }
  };
  
  const handleClearSelections = () => {
    setSelectedStyle(null);
    setSelectedBackgrounds([]);
    setCurrentStep(3);
  };
  
  const totalImagesToGenerate = productImages.length * selectedBackgrounds.reduce((sum, bg) => sum + bg.count, 0);

  const handleUpdateCount = (id: string, delta: number) => {
    const currentTotalCount = selectedBackgrounds.reduce((sum, bg) => sum + bg.count, 0);
    if (productImages.length * (currentTotalCount + delta) > MAX_IMAGES && delta > 0) return;
    setSelectedBackgrounds(prev => prev.map(bg => bg.id === id ? { ...bg, count: Math.max(1, bg.count + delta) } : bg));
  };

  const handleDirectionSelect = (bgId: string, category: DirectionCategory, directionPrompt: string | null) => {
    setSelectedBackgrounds(prev => prev.map(bg => {
      if (bg.id === bgId) {
        const newDirections = { ...bg.directions };
        newDirections[category] = newDirections[category] === directionPrompt ? null : directionPrompt;
        return { ...bg, directions: newDirections };
      }
      return bg;
    }));
  };

  const handleToggleMatchPalette = (bgId: string) => {
    setSelectedBackgrounds(prev => prev.map(bg => bg.id === bgId ? { ...bg, matchPalette: !bg.matchPalette } : bg));
  };
  
  const handleNegativePromptChange = (bgId: string, value: string) => {
    setSelectedBackgrounds(prev => prev.map(bg => bg.id === bgId ? { ...bg, negativePrompt: value } : bg));
  };

  const generateImage = useCallback(async (style: VisualStyle, background: SelectedBackground, image: ProductImage): Promise<GeneratedImage> => {
    let promptParts = [`INSTRUCTION: Take the product from the provided image and place it in a new scene.`];
    promptParts.push(`SCENE: ${background.prompt}`);
    promptParts.push(`STYLE: ${style.prompt}`);
    const directionPrompts = Object.values(background.directions).filter(Boolean).join(', ');
    if (directionPrompts) promptParts.push(`DIRECTIONS: ${directionPrompts}`);
    if (background.matchPalette && image.palette && image.palette.length > 0) {
      promptParts.push(`HARMONIZE COLORS: Ensure the background scenery and lighting complement the product's primary colors. Product color palette: [${image.palette.join(', ')}].`);
    }
    if (background.negativePrompt?.trim()) {
      promptParts.push(`NEGATIVE PROMPT: DO NOT include the following elements: ${background.negativePrompt.trim()}.`);
    }

    const fullPrompt = promptParts.join('\n');
    const imagePart = { inlineData: { data: image.processedData || image.data, mimeType: image.mimeType } };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, { text: fullPrompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });
      const newImagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

      if (newImagePart?.inlineData) {
        return { id: uuid(), sourceId: image.id, data: newImagePart.inlineData.data, mimeType: newImagePart.inlineData.mimeType, prompt: fullPrompt };
      } else {
        throw new Error(`Model did not return an image. Reason: ${response.candidates?.[0]?.finishReason || 'Unknown'}`);
      }
    } catch (e: any) {
      console.error(`Error generating image for prompt: "${background.name}"`, e);
      throw new Error(`Failed to generate image for "${background.name.substring(0, 30)}...".`);
    }
  }, []);

  const handleGenerate = async () => {
    if (!areAllProductsProcessed || !selectedStyle || selectedBackgrounds.length === 0 || totalImagesToGenerate > MAX_IMAGES) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setActiveOverlayId(null);

    const generationJobs = productImages.flatMap(product =>
      selectedBackgrounds.flatMap(bg => Array(bg.count).fill(null).map(() => ({ product, bg })))
    );

    try {
      const results = await Promise.all(generationJobs.map(job => generateImage(selectedStyle, job.bg, job.product)));
      setGeneratedImages(results);
      saveToHistory(results);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during image generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (generatedImages.length > 0) resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [generatedImages]);

  // --- PRESET & HISTORY HANDLERS ---
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      setError("Please enter a name for your preset.");
      return;
    }
    const newPreset: Preset = { name: presetName, style: selectedStyle, backgrounds: selectedBackgrounds };
    const updatedPresets = [...presets.filter(p => p.name !== presetName), newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('productGenPresets', JSON.stringify(updatedPresets));
    setPresetName('');
  };

  const handleApplyPreset = (preset: Preset) => {
    setSelectedStyle(preset.style);
    setSelectedBackgrounds(preset.backgrounds);
  };
  
  const handleDeletePreset = (name: string) => {
    const updatedPresets = presets.filter(p => p.name !== name);
    setPresets(updatedPresets);
    localStorage.setItem('productGenPresets', JSON.stringify(updatedPresets));
  };

  const saveToHistory = (results: GeneratedImage[]) => {
    const newEntry: HistoryEntry = {
      id: uuid(),
      date: new Date().toISOString(),
      previewSrc: `data:${results[0].mimeType};base64,${results[0].data}`,
      imageCount: results.length,
      jobData: { productImages, selectedStyle, selectedBackgrounds, generatedImages: results }
    };
    const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep last 20 jobs
    setHistory(updatedHistory);
    localStorage.setItem('productGenHistory', JSON.stringify(updatedHistory));
  };
  
  const handleLoadFromHistory = (entry: HistoryEntry) => {
    setProductImages(entry.jobData.productImages);
    setSelectedStyle(entry.jobData.selectedStyle);
    setSelectedBackgrounds(entry.jobData.selectedBackgrounds);
    setGeneratedImages(entry.jobData.generatedImages);
    setShowHistoryModal(false);
  };

  // --- IMAGE ACTION HANDLERS ---
  const handleDownloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = `data:${image.mimeType};base64,${image.data}`;
    link.download = `generated_image_${image.id.substring(0, 8)}.${image.mimeType.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async (productId: string, productIndex: number) => {
    const zip = new JSZip();
    const imagesToZip = generatedImages.filter(img => img.sourceId === productId);
    if (imagesToZip.length === 0) return;

    imagesToZip.forEach((image, index) => {
        const ext = image.mimeType.split('/')[1] || 'png';
        const fileName = `Product-${productIndex + 1}_Image-${index + 1}.${ext}`;
        zip.file(fileName, image.data, { base64: true });
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `Product-${productIndex + 1}_Images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Failed to create zip file", e);
        setError("Failed to create zip file for download.");
    }
  };

  const handleUpscale = async (image: GeneratedImage) => {
    setUpscalingId(image.id);
    setError(null);
    try {
      const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, { text: "Upscale this image to a higher resolution, enhancing details and clarity without changing the content or style." }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });
      const newImagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

      if (newImagePart?.inlineData) {
        setGeneratedImages(prev => prev.map(img => img.id === image.id ? { ...img, data: newImagePart.inlineData.data, mimeType: newImagePart.inlineData.mimeType } : img));
      } else {
        throw new Error("Upscale failed: Model did not return an image.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpscalingId(null);
    }
  };

  const handleGenerateVariations = async (image: GeneratedImage) => {
    if ((generatedImages.length + 3) > MAX_IMAGES) {
      setError("Cannot generate variations, as it would exceed the maximum image limit of " + MAX_IMAGES);
      return;
    }
    setVariationsLoadingId(image.id);
    setError(null);
    try {
      const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
      const textPart = { text: `Generate a creative variation of this image based on the original prompt: "${image.prompt}"` };
      const promises = Array(3).fill(null).map(() => 
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts: [imagePart, textPart] },
          config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        })
      );
      const responses = await Promise.all(promises);
      const newImages = responses.map(res => {
        const newPart = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (newPart?.inlineData) {
          return { id: uuid(), sourceId: image.sourceId, data: newPart.inlineData.data, mimeType: newPart.inlineData.mimeType, prompt: image.prompt };
        }
        return null;
      }).filter(Boolean) as GeneratedImage[];
      
      setGeneratedImages(prev => [...prev, ...newImages]);
    } catch (e: any) {
      setError("Failed to generate variations.");
    } finally {
      setVariationsLoadingId(null);
    }
  };
  
  const handleReimagine = async () => {
    if (!editingImage || !reimaginePrompt) return;
    setIsReimagining(true);
    setError(null);
    try {
      const imagePart = { inlineData: { data: editingImage.data, mimeType: editingImage.mimeType } };
      const textPart = { text: `Take the provided image and edit it based on this instruction: "${reimaginePrompt}"` };
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });
      const newImagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (newImagePart?.inlineData) {
        const updatedImage = { ...editingImage, data: newImagePart.inlineData.data, mimeType: newImagePart.inlineData.mimeType };
        setEditingImage(updatedImage);
        setGeneratedImages(prev => prev.map(img => img.id === editingImage.id ? updatedImage : img));
      } else {
        throw new Error("AI Edit failed: The model did not return a new image.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsReimagining(false);
    }
  };

  // --- RENDER ---
  
  return (
    <>
      <main>
        <header>
          <h1>Product Background Generator</h1>
          <p>Instantly create stunning, studio-quality backgrounds for any product. Follow the steps below to transform your photos.</p>
          <div className="header-actions">
            <button className="header-button" onClick={() => setShowHistoryModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M12 8v4l2 2"/></svg>
              History
            </button>
          </div>
        </header>

        {/* --- STEP 1: UPLOAD --- */}
        {currentStep === 1 && (
            <section className="card">
            <StepIndicator step={1} title="Upload Your Product(s)" active={true} />
            <div className="upload-area" onClick={() => document.getElementById('image-upload')?.click()}>
                <input type="file" id="image-upload" accept="image/*" multiple onChange={handleImageUpload} />
                <p>{isUploading ? "Processing..." : "Drag & drop or "}<span>{isUploading ? "" : "click to upload"}</span></p>
            </div>
            </section>
        )}

        {/* --- STEP 2: PROCESS --- */}
        {currentStep === 2 && (
          <section className="card">
              <StepIndicator step={2} title="Prepare Your Images" active={true} />
              <p className="step-subtitle">For best results, remove the background. You can do this for each image below.</p>
              <div className="product-thumbnail-grid">
                  {productImages.map((p, index) => (
                      <div key={p.id} className={`product-thumbnail ${p.isProcessed ? 'processed' : ''}`}>
                          <img src={`data:${p.mimeType};base64,${p.processedData || p.data}`} alt={`Product ${index + 1}`} />
                          <div className="product-thumbnail-overlay">
                              <p>Product {index + 1}</p>
                              {!p.isProcessed && (
                                  <div className="thumbnail-actions">
                                      <button onClick={() => handleRemoveBackground(p)} disabled={isRemovingBackground === p.id}>
                                          {isRemovingBackground === p.id ? <div className="spinner-dark"/> : 'Remove BG'}
                                      </button>
                                      <button onClick={() => handleSkipBackgroundRemoval(p.id)} disabled={!!isRemovingBackground}>Skip</button>
                                  </div>
                              )}
                          </div>
                           <button onClick={() => handleRemoveProductImage(p.id)} className="remove-thumbnail-button">&times;</button>
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* --- STEP 3: STYLE --- */}
        {currentStep >= 3 && areAllProductsProcessed && (
          <section className="card">
            <StepIndicator step={3} title="Choose a Visual Style" active={!selectedStyle} />
            {!selectedStyle ? (
              <div className="style-grid">
                {VISUAL_STYLES.map(style => (
                  <div key={style.name} className="style-card" onClick={() => setSelectedStyle(style)}>
                    <div className="style-card-header"><div className="style-icon" dangerouslySetInnerHTML={{ __html: style.icon }} /><h3 className="style-name">{style.name}</h3></div>
                    <p className="style-description">{style.description}</p>
                  </div>
                ))}
              </div>
            ) : (
               <div className="selected-summary">
                 <h3>{selectedStyle.name}</h3><p>{selectedStyle.description}</p>
                 <button onClick={() => setSelectedStyle(null)} className="change-button">Change Style</button>
               </div>
            )}
          </section>
        )}

        {/* --- STEP 4: BACKGROUNDS & PRESETS --- */}
        {currentStep >= 4 && selectedStyle && (
          <>
          <section className="card">
            <StepIndicator step={4} title="Select Backgrounds & Presets" active={selectedBackgrounds.length === 0} />
            <div className="presets-section">
              <h4>My Presets</h4>
              <div className="preset-controls">
                <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="New preset name..." />
                <button onClick={handleSavePreset} disabled={!presetName || selectedBackgrounds.length === 0}>Save Current</button>
              </div>
              <div className="preset-list">
                {presets.map(p => (
                  <div key={p.name} className="preset-item">
                    <span>{p.name}</span>
                    <div className="preset-item-actions">
                      <button onClick={() => handleApplyPreset(p)}>Apply</button>
                      <button onClick={() => handleDeletePreset(p.name)} className="delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="carousel-wrapper">
              <button className="carousel-nav left" onClick={() => carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>&#8249;</button>
              <div className="carousel-container" ref={carouselRef}>
                {Object.entries(CUSTOM_BACKGROUNDS).map(([category, options]) => (
                  <div key={category} className="carousel-card">
                    <h3>{category}</h3>
                    <div className="background-options-list">
                      {options.map(opt => (
                        <button key={opt.name} className={`background-button ${selectedBackgrounds.some(bg => bg.prompt === opt.prompt) ? 'selected' : ''}`} onClick={() => handleBackgroundSelect(opt.name, opt.prompt)}>{opt.name}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-nav right" onClick={() => carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>&#8250;</button>
            </div>
             <div className="custom-prompt-section">
                <input type="text" className="prompt-input" placeholder="Or type your own custom background prompt..." value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCustomPrompt()}/>
                <button className="add-button" onClick={handleAddCustomPrompt} disabled={!customPrompt}>Add</button>
              </div>
          </section>
          </>
        )}

        {/* --- STEP 5: REVIEW --- */}
        {currentStep >= 5 && selectedBackgrounds.length > 0 && (
          <section className="card">
             <StepIndicator step={5} title="Review & Customize" active={true}>
                <button onClick={handleClearSelections} className="clear-button">Clear Selections</button>
             </StepIndicator>
             <div className="review-list">
                {selectedBackgrounds.map(bg => (
                  <div key={bg.id} className="review-item-wrapper">
                    <div className="review-item">
                      <span className="review-item-name">{bg.name.length > 40 ? `${bg.name.substring(0, 40)}...` : bg.name}</span>
                      <div className="review-item-controls">
                        <button className="customize-button" onClick={() => setExpandedReviewItem(expandedReviewItem === bg.id ? null : bg.id)}>Customize</button>
                        <button className="count-button" onClick={() => handleUpdateCount(bg.id, -1)} disabled={bg.count <= 1}>-</button>
                        <span>{bg.count}</span>
                        <button className="count-button" onClick={() => handleUpdateCount(bg.id, 1)} disabled={totalImagesToGenerate >= MAX_IMAGES}>+</button>
                        <button onClick={() => setSelectedBackgrounds(p => p.filter(b => b.id !== bg.id))} className="remove-button">&times;</button>
                      </div>
                    </div>
                    {expandedReviewItem === bg.id && (
                        <div className="directions-panel">
                            {Object.entries(PHOTOGRAPHIC_DIRECTIONS).map(([category, options]) => (
                                <div key={category} className="direction-category">
                                    <h4>{category}</h4>
                                    <div className="direction-options">
                                    {options.map(opt => ( <button key={opt.name} className={`direction-button ${bg.directions[category as DirectionCategory] === opt.prompt ? 'selected' : ''}`} onClick={() => handleDirectionSelect(bg.id, category as DirectionCategory, opt.prompt)}>{opt.name}</button> ))}
                                    </div>
                                </div>
                            ))}
                            <div className="direction-category smart-color-category">
                                <h4>Smart Color</h4>
                                <div className="toggle-switch-container">
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={bg.matchPalette} onChange={() => handleToggleMatchPalette(bg.id)} />
                                        <span className="slider round"></span>
                                    </label>
                                    <span>Match Product Palette</span>
                                </div>
                            </div>
                            <div className="direction-category">
                                <h4>Negative Prompts</h4>
                                <p className="direction-description">Exclude elements (e.g., "text, people, shadows").</p>
                                <input 
                                    type="text" 
                                    className="negative-prompt-input"
                                    placeholder="Comma-separated words..."
                                    value={bg.negativePrompt}
                                    onChange={(e) => handleNegativePromptChange(bg.id, e.target.value)} 
                                />
                            </div>
                        </div>
                    )}
                  </div>
                ))}
             </div>
          </section>
        )}
        
        {/* --- GENERATE --- */}
        {selectedBackgrounds.length > 0 && areAllProductsProcessed && (
            <div className="generate-section">
                <p className={`total-images-indicator ${totalImagesToGenerate > MAX_IMAGES ? 'limit-exceeded' : ''}`}>
                    {totalImagesToGenerate > MAX_IMAGES ? `Limit of ${MAX_IMAGES} images exceeded!` : `Total Images to Generate: ${totalImagesToGenerate}`}
                </p>
                <button onClick={handleGenerate} className="generate-button" disabled={isGenerating || totalImagesToGenerate === 0 || totalImagesToGenerate > MAX_IMAGES}>
                    {isGenerating ? <><div className="spinner" /> Generating...</> : `Generate Images`}
                </button>
            </div>
        )}

        {error && <div className="error">{error}</div>}
        {(isGenerating && generatedImages.length === 0) && <div className="loading">Generating your images... this may take a moment.</div>}

        {/* --- RESULTS --- */}
        {generatedImages.length > 0 && (
          <section ref={resultsRef} className="results-section card">
            <h2>Your Generated Images</h2>
            {productImages.map((p, index) => (
              <div key={p.id} className="result-group">
                <div className="result-group-header">
                  <h3>Product {index + 1}</h3>
                  <button onClick={() => handleDownloadAll(p.id, index)} className="download-all-button">Download All</button>
                </div>
                <div className="results-grid">
                  {generatedImages.filter(img => img.sourceId === p.id).map(image => {
                    const isProcessing = upscalingId === image.id || variationsLoadingId === image.id;
                    const canGenerateVariations = generatedImages.length + 3 <= MAX_IMAGES;
                    return (
                      <div key={image.id} className="result-image-container" onClick={() => !isProcessing && setActiveOverlayId(activeOverlayId === image.id ? null : image.id)}>
                          <img src={`data:${image.mimeType};base64,${image.data}`} alt={image.prompt} className="result-image" />
                          {(isProcessing) && <div className="processing-overlay"><div className="spinner"/><span>{upscalingId === image.id ? 'Upscaling...' : 'Creating...'}</span></div>}
                          <div className={`result-image-overlay ${activeOverlayId === image.id ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
                              <button onClick={() => setPreviewImage(image)} disabled={isProcessing}>Preview</button>
                              <button onClick={() => handleDownloadImage(image)} disabled={isProcessing}>Download</button>
                              <button onClick={() => { setEditingImage(image); setImageAdjustments({brightness: 100, contrast: 100, saturation: 100}); }} disabled={isProcessing}>Edit</button>
                              <button onClick={() => handleUpscale(image)} disabled={isProcessing}>Upscale</button>
                              <button onClick={() => handleGenerateVariations(image)} disabled={isProcessing || !canGenerateVariations} title={!canGenerateVariations ? `Exceeds limit of ${MAX_IMAGES}`: ''}>Variations</button>
                          </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* --- MODALS --- */}
      {previewImage && <div className="preview-overlay" onClick={() => setPreviewImage(null)}><div className="preview-content" onClick={e => e.stopPropagation()}><img src={`data:${previewImage.mimeType};base64,${previewImage.data}`} alt="Full-screen preview" className="preview-image"/><div className="preview-actions"><button onClick={() => handleDownloadImage(previewImage)} className="preview-download-button">Download</button><button onClick={() => setPreviewImage(null)} className="preview-close-button">Close</button></div></div></div>}
      {showHistoryModal && <div className="history-modal-overlay" onClick={() => setShowHistoryModal(false)}><div className="history-modal" onClick={e => e.stopPropagation()}><h2>Generation History</h2><div className="history-list">{history.length > 0 ? history.map(h => (<div key={h.id} className="history-item"><img src={h.previewSrc} alt="History preview" /><div className="history-item-info"><p><strong>{new Date(h.date).toLocaleString()}</strong></p><p>{h.imageCount} images generated</p></div><div className="history-item-actions"><button onClick={() => handleLoadFromHistory(h)}>Load</button></div></div>)) : <p>No history yet.</p>}</div></div></div>}
      {editingImage && (
        <div className="edit-overlay" onClick={() => setEditingImage(null)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="edit-preview">
              <img src={`data:${editingImage.mimeType};base64,${editingImage.data}`} alt="Editing preview" style={{ filter: `brightness(${imageAdjustments.brightness}%) contrast(${imageAdjustments.contrast}%) saturate(${imageAdjustments.saturation}%)` }} />
            </div>
            <div className="edit-sidebar">
              <h3>Edit Image</h3>
              <div className="edit-section">
                <h4>AI Re-imagine</h4>
                <p>Describe a change, like "add confetti" or "change the lighting to be more dramatic".</p>
                <textarea value={reimaginePrompt} onChange={e => setReimaginePrompt(e.target.value)} placeholder="e.g., make it look like it's snowing..."></textarea>
                <div className="preset-buttons-grid">
                  {Object.entries(EDIT_PRESETS).map(([category, presets]) => (
                    presets.map(p => <button key={p} onClick={() => setReimaginePrompt(p)} className="preset-button">{p}</button>)
                  ))}
                </div>
                <button onClick={handleReimagine} className="generate-button" disabled={isReimagining || !reimaginePrompt}>{isReimagining ? <div className="spinner"/> : 'Apply AI Edit'}</button>
              </div>
              <div className="edit-section">
                  <h4>Image Adjustments</h4>
                  <div className="adjustment-item"><label>Brightness</label><input type="range" min="50" max="150" value={imageAdjustments.brightness} onChange={e => setImageAdjustments(s => ({...s, brightness: +e.target.value}))} className="adjustment-slider" /></div>
                  <div className="adjustment-item"><label>Contrast</label><input type="range" min="50" max="150" value={imageAdjustments.contrast} onChange={e => setImageAdjustments(s => ({...s, contrast: +e.target.value}))} className="adjustment-slider" /></div>
                  <div className="adjustment-item"><label>Saturation</label><input type="range" min="0" max="200" value={imageAdjustments.saturation} onChange={e => setImageAdjustments(s => ({...s, saturation: +e.target.value}))} className="adjustment-slider" /></div>
              </div>
              <div className="edit-modal-actions">
                  <button onClick={() => handleDownloadImage(editingImage)} className="download-all-button">Download</button>
                  <button onClick={() => setEditingImage(null)} className="change-button">Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);