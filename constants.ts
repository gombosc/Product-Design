/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- DATA CONSTANTS ---

export const VISUAL_STYLES = [
    { name: 'Hyper Realistic', description: 'Ultra-detailed, photorealistic rendering with lifelike textures and lighting.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L6 7l6 5 6-5-6-5z"/><path d="M6 17l6 5 6-5"/><path d="M6 12l6 5 6-5"/></svg>`, prompt: 'A hyper-realistic, high-resolution macro photograph of the product. Emphasize lifelike textures and natural, soft-window lighting that highlights crisp details, making it indistinguishable from a real photo.' },
    { name: '3D Claymation', description: 'Charming, handcrafted look with visible fingerprints and soft, rounded shapes.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.7.7a5.4 5.4 0 0 0 0 7.65l.7.7a5.4 5.4 0 0 0 7.65 0l.7-.7a5.4 5.4 0 0 0 0-7.65l-.7-.7z"/><path d="m9 15 1-1"/><path d="m14 10-1 1"/><path d="m11 13 2-2"/><path d="m13 11 2-2"/><path d="m8 12 3-3"/></svg>`, prompt: 'A close-up shot of the product, rendered in a 3D claymation style. Everything should look handcrafted from modeling clay, with soft, rounded edges, visible fingerprints, and a slightly imperfect, tactile quality under warm, soft lighting.' },
    { name: 'Ghibli-Inspired', description: 'Lush, hand-painted anime style with a sense of wonder and beautiful landscapes.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 16a2.5 2.5 0 0 1 5 0c0 1.4-1.1 2.5-2.5 2.5S2.5 17.4 2.5 16Z"/><path d="M21.5 16a2.5 2.5 0 0 0-5 0c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5Z"/><path d="M7.5 16v-4.5a2.5 2.5 0 0 1 5 0V16"/><path d="M2.5 16h5"/><path d="M16.5 16h5"/><path d="M12.5 11.5a2.5 2.5 0 0 1-5 0V7a5 5 0 0 1 10 0v4.5a2.5 2.5 0 0 1-5 0Z"/></svg>`, prompt: 'An illustration of the product in a Ghibli-inspired anime style. The product should be the clear focus, set against a lush, hand-painted watercolor background with soft, nostalgic lighting to create a whimsical atmosphere.' },
    { name: 'Vintage Polaroid', description: 'Faded colors, soft focus, and a classic white border for a nostalgic, retro feel.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M6.5 12.5a2.5 2.5 0 0 1 5 0V15H9v-2.5a2.5 2.5 0 0 1-2.5-2.5V10"/><path d="M15 10h2.5a2.5 2.5 0 0 1 0 5H15v-5Z"/></svg>`, prompt: 'A simulated vintage Polaroid photograph of the product. Apply a soft focus with a shallow depth of field, a faded color palette with a warm yellow tint, light leaks, and a classic instant film border.' },
    { name: 'Isometric 3D', description: 'Clean, stylized 3D graphics on a floating diorama with a clean, playful aesthetic.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.12 6.4-6.05-4.06a2 2 0 0 0-2.17-.02L2.92 6.42a2 2 0 0 0-1.01 1.75v8.52a2 2 0 0 0 1.13 1.78l6.1 3.94a2 2 0 0 0 2.02 0l6.08-3.94a2 2 0 0 0 1.13-1.78V8.1a2 2 0 0 0-.98-1.7z"/><path d="M12 22V12"/><path d="m22 8-10 7-10-7"/><path d="M12 12 2.92 6.42"/></svg>`, prompt: 'A clean, isometric 3D illustration of the product as the central element on a small, floating diorama. Use simplified geometry, a bright color palette, and soft, ambient lighting.' },
    { name: 'Blueprint Schematic', description: 'Technical, monochrome line art on a blue background, as if from an engineer\'s draft.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.28 21.28H2.72V2.72h18.56Z"/><path d="M12 16.27V7.72"/><path d="m16.27 12-8.55 0"/><path d="M12 2.72v18.56"/><path d="M2.72 12h18.56"/><path d="m15.09 15.09-6.18-6.18"/><path d="m15.09 8.91-6.18 6.18"/></svg>`, prompt: 'A technical blueprint schematic focusing on the product. Use precise, clean white line art with annotations and measurements on a deep blue background to highlight its design and construction.' },
    { name: 'Pop Art', description: 'Bold outlines, vibrant, blocky colors, and Ben-Day dots, in the style of Warhol.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="1"></circle><circle cx="12" cy="7" r="1"></circle><circle cx="17" cy="7" r="1"></circle><circle cx="7" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="17" cy="12" r="1"></circle><circle cx="7" cy="17" r="1"></circle><circle cx="12" cy="17" r="1"></circle><circle cx="17" cy="17" r="1"></circle></svg>`, prompt: 'A vibrant Pop Art composition featuring the product. Use bold, black outlines, flat planes of saturated color, and incorporate halftone or Ben-Day dot patterns in the background to make the product stand out.' },
    { name: 'Risograph Print', description: 'Grainy texture, limited color palette, and slight misalignments for an artistic, printed look.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h.01"/><path d="M12 8h.01"/><path d="M16 12h.01"/><path d="M12 16h.01"/><path d="M9.5 9.5h.01"/><path d="M14.5 9.5h.01"/><path d="M9.5 14.5h.01"/><path d="M14.5 14.5h.01"/></svg>`, prompt: 'A simulated Risograph print of the product. The image should have a characteristic grainy texture, use a limited and bright 2-color palette, and show slight, charming misalignments between color layers to give it an artistic feel.' },
    { name: 'Oil Painting', description: 'Rich, textured brushstrokes and deep, blended colors, as if painted on canvas.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="m15 5 4 4"/></svg>`, prompt: 'A classical oil painting focusing on the product. Use visible, textured brushstrokes and dramatic chiaruro lighting to create a sense of depth and richness, as if painted by an Old Master.' },
    { name: 'Watercolor Sketch', description: 'Soft, translucent washes of color, loose lines, and visible paper texture.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`, prompt: 'A watercolor sketch of the product. Use loose ink outlines to define the product, with soft, translucent color washes bleeding into a simple background, ensuring the watercolor paper texture is visible.' },
    { name: 'Blender 3D Render', description: 'Polished and clean 3D render with perfect lighting and smooth surfaces.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><path d="m12 9-2.5 4.33"></path><path d="m14.5 16.33-2.5-4.33"></path><path d="m9.5 16.33 2.5-4.33"></path></svg>`, prompt: 'A clean, polished 3D render of the product, as if created in Blender. Use studio-quality three-point lighting to highlight its perfect, smooth surfaces and realistic material shaders.' },
    { name: '2D Flat Illustration', description: 'Minimalist vector art with simple shapes, no gradients, and a limited color palette.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="M13 13h6v6h-6z"/></svg>`, prompt: 'A 2D flat vector illustration focusing on the product. Use simple geometric shapes and solid blocks of color from a minimalist palette, with no gradients or shadows, to emphasize its iconic form.' },
    { name: 'Cinematic Noir', description: 'High-contrast black and white, dramatic shadows, and a moody, mysterious atmosphere.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`, prompt: 'A cinematic film noir style shot of the product. Use high-contrast black and white with dramatic, low-key lighting to cast long, deep shadows, creating a mysterious and moody atmosphere.' },
    { name: 'Double Exposure', description: 'A creative blend of the product and a secondary texture, like a forest or cityscape.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16.5c3.6-1.6 5.5-5.9 3.9-9.5s-5.9-5.5-9.5-3.9c-1.9.8-3.3 2.3-4 4"/><path d="M10 8.5c-3.6 1.6-5.5 5.9-3.9 9.5s5.9 5.5 9.5 3.9c1.9-.8 3.3-2.3 4-4"/></svg>`, prompt: 'A double exposure image where the primary silhouette is the product, with a secondary, evocative image (like a dense forest or a sprawling cityscape) artistically blended within its contours.' },
    { name: 'Pixel Art', description: 'Retro 16-bit video game aesthetic with a limited color palette and visible pixels.', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`, prompt: 'A 16-bit pixel art sprite of the product. The image should be composed of visible square pixels and use a limited color palette, presented as if it were an item in a classic SNES video game.' },
];
export const CUSTOM_BACKGROUNDS = {
    'Aspirational Lifestyle & Home': [
        { name: 'The Sun-drenched Scandinavian Loft', prompt: 'A medium shot of the product on a table in a sun-drenched Scandinavian loft. The scene is captured with soft morning light streaming through large windows, creating gentle highlights on the product. Minimalist furniture is artfully blurred in the background.' },
        { name: 'The Artisan\'s Workshop', prompt: 'A close-up shot of the product on a workbench in a beautiful, messy artisan\'s workshop. Warm, focused light illuminates the product, with raw materials like wood shavings and neatly hung tools visible in the soft-focus background.' },
        { name: 'The \'Golden Hour\' Family Kitchen', prompt: 'A warm, lived-in family kitchen during the \'golden hour\'. The product sits on a stone countertop, with sunlight streaming in from the side to create a beautiful flare. A child\'s drawing on the refrigerator is softly blurred in the background.' },
        { name: 'The Zen Reading Nook', prompt: 'A cozy, quiet reading nook. The composition is a tight shot focusing on the product placed next to a stack of books, with the soft glow of a single warm lamp creating a calm, focused mood against a dark wall.' },
        { name: 'The Bustling Parisian Café Terrace', prompt: 'A chic Parisian café terrace. The product is the sharp focus on a small, round metal table, with a croissant and coffee nearby. A shallow depth of field blurs the classic architecture and a stylish passerby in the background.' },
        { name: 'The Modern Rooftop Terrace Garden', prompt: 'A modern urban rooftop terrace garden at dusk. The shot focuses on the product, with the warm glow of string lights creating beautiful bokeh from the blurred city skyline behind it.' },
        { name: 'The Cozy Log Cabin by the Fireplace', prompt: 'A cozy log cabin interior. The product is on a sheepskin rug, with the warm, flickering light from a roaring fireplace casting a gentle glow on it. Snow is visible falling outside the window in the background.' },
        { name: 'The Minimalist Japanese Tea Room', prompt: 'A serene and minimalist Japanese tea room. The scene is a low-angle shot from the tatami mat flooring, making the product look elegant. Dramatic shadows are cast by the shoji screen walls.' },
        { name: 'The Collector\'s Library', prompt: 'A dark academia-themed collector\'s library. The shot is a low angle looking up at the product placed on a ledge, making the floor-to-ceiling bookshelves seem towering and grand in the background.' },
        { name: 'The Bohemian Balcony Garden', prompt: 'A lush bohemian balcony garden at twilight. The shot focuses on the product, with the magical glow of fairy lights woven through hanging plants creating a soft, dreamy background.' },
        { name: 'The Grand Piano in a Sunroom', prompt: 'A polished black grand piano in a bright sunroom. The shot focuses on the reflection of the product on the piano\'s pristine surface, with dramatic shadows cast by elegant indoor trees.' }
    ],
    'Professional & Commercial Environments': [
        { name: 'The Collaborative Tech Start-up Hub', prompt: 'An innovative tech start-up hub. The product is in sharp focus on a desk, while the glass walls behind it reflect the city view. Developers are blurred in the background, working on whiteboards.' },
        { name: 'The High-Fashion Retail Boutique', prompt: 'A minimalist, luxurious retail boutique. The product is displayed on a marble pedestal, lit by a single, dramatic, focused spotlight that makes it the sole hero of the shot. The concrete wall behind is in shadow.' },
        { name: 'The Serene Wellness Spa', prompt: 'A serene wellness spa. The product is placed next to neatly stacked hot stones and a single orchid, bathed in soft, diffused, tranquil light. The natural stone and bamboo background is softly out of focus.' },
        { name: 'The Architect\'s Drafting Table at Night', prompt: 'An architect\'s drafting table at night. A single desk lamp illuminates a close-up of the product\'s sharp lines next to precise rulers on a blueprint, creating a stark, high-contrast scene.' },
        { name: 'The Bustling Stock Exchange Trading Floor', prompt: 'An energetic stock exchange trading floor. The shot uses a shallow depth of field, keeping the product in crisp focus while a glowing red stock chart on a screen is artistically blurred in the background.' },
        { name: 'The Michelin-Star Restaurant Kitchen', prompt: 'The heart of a Michelin-star restaurant kitchen. The scene focuses on a chef\'s hands delicately plating a dish, with the product placed in the immediate foreground, in sharp focus, on a stainless steel surface.' },
        { name: 'The University Lecture Hall', prompt: 'A grand, classic university lecture hall. The scene is captured with \'golden hour\' light streaming through arched windows, illuminating the product on a rich, old wooden desk and creating long shadows.' },
        { name: 'The Executive Boardroom on the Top Floor', prompt: 'A sleek, modern executive boardroom at night. The product sits on a massive polished glass table, perfectly reflecting the panoramic city lights from the floor-to-ceiling windows behind it.' },
        { name: 'The Scientist\'s Cleanroom Laboratory', prompt: 'A sterile, brightly lit scientist\'s cleanroom laboratory. The product is the central focus, while in the background, a scientist in a full protective suit and glowing liquids in vials are blurred.' },
        { name: 'The Luxury Hotel Lobby', prompt: 'The opulent lobby of a luxury hotel. The shot is a low angle looking up past the product, focusing on the intricate, sparkling details of a massive crystal chandelier above.' }
    ],
    'Rugged & Natural Settings': [
        { name: 'The Misty Redwood Forest Floor', prompt: 'The floor of a misty redwood forest. The product rests on a bed of rich moss, with dappled light breaking through the foggy canopy to create beautiful, natural spotlights on it.' },
        { name: 'The Volcanic Black Sand Beach at Dusk', prompt: 'A dramatic volcanic black sand beach at dusk. The shot is a low-angle view, capturing the high contrast of waves crashing and sending white seafoam over the dark, wet sand that reflects the purple sky.' },
        { name: 'The Himalayan Mountain Basecamp', prompt: 'A Himalayan mountain basecamp. The product is situated on a rocky ledge, with sharp, clear sunlight creating high contrast and wind-blown snow conveying a sense of extreme performance.' },
        { name: 'The Joshua Tree Desertscape at Sunrise', prompt: 'A Joshua Tree desertscape at sunrise. The product sits on a warm, weathered rock, with the low sun creating a long shadow from a distinctive Joshua Tree against a soft pink sky.' },
        { name: 'The Amazon Rainforest Canopy Walkway', prompt: 'High on a canopy walkway in the Amazon rainforest. The scene uses a shallow depth of field, keeping the product sharp while a colorful toucan is visible in the blurred, densely green background.' },
        { name: 'The Salt Flats at Midday', prompt: 'A vast, minimalist salt flat landscape. The shot emphasizes the immense sense of scale, with the product casting a single, harsh shadow on the perfectly flat, white expanse under a deep blue sky.' },
        { name: 'The Underwater Coral Reef', prompt: 'A vibrant, serene underwater coral reef. The shot captures shimmering shafts of sunlight filtering through the clear blue water, illuminating the product on a patch of sand as a sea turtle swims by in the background.' },
        { name: 'The Geothermal Hot Spring in Iceland', prompt: 'On a dark volcanic rock beside a steaming geothermal hot spring. The scene captures thick, moody steam partially obscuring the snow-dusted lava fields in the background, creating a sense of mystery.' },
        { name: 'The African Savannah at Sunset', prompt: 'On a termite mound in the vast, golden African savannah. The scene is a dramatic silhouette shot, with the product and a herd of elephants in the distant background against a fiery sunset.' },
        { name: 'The Inside of a Crystal Ice Cave', prompt: 'Inside a glowing, crystal-clear ice cave. The shot focuses on the surreal, magical glow as sunlight from outside makes the deep, translucent blue walls shimmer and create beautiful refraction patterns.' }
    ],
    'Abstract & Conceptual Studios': [
        { name: 'The Monochromatic Color-Drenched Room', prompt: 'A monochromatic room saturated in Yves Klein Blue. The product is the only object, casting a single, hard shadow under a dramatic spotlight, emphasizing its form.' },
        { name: 'The Bauhaus Geometric Studio', prompt: 'A studio of overlapping geometric shapes in primary colors. The shot is a balanced, abstract composition that integrates the product\'s shape with the graphic forms.' },
        { name: 'The Polished Concrete & Lush Moss Gallery', prompt: 'A macro shot exploring the juxtaposition of textures, focusing on the intersection where the product touches both a cold, grey concrete slab and a vibrant, soft patch of green moss.' },
        { name: 'The Surreal Floating Islands-cape', prompt: 'A dreamlike scene where the product rests on a small, grass-covered island floating in a soft, cloud-filled sky at sunrise, creating a whimsical and serene mood.' },
        { name: 'The Infinity Mirror Room', prompt: 'An infinity mirror room with blue and gold lights. The camera angle creates a mind-bending, endless geometric pattern from the product\'s reflections.' },
        { name: 'The Suspended Silk Fabric Installation', prompt: 'A soft, ethereal environment where the product is nestled within large, flowing swathes of dusty rose silk fabric, with soft, diffused lighting creating a gentle, dreamy mood.' },
        { name: 'The Shattered Glass & Light Studio', prompt: 'A dramatic, high-contrast studio where the product sits amongst sharp shards of a shattered mirror. A single beam of light creates a dramatic lens flare and glints off the sharp edges.' },
        { name: 'The Liquid Metal Sculpture Studio', prompt: 'A high-contrast studio where the product is surrounded by flowing shapes of liquid gold, frozen mid-splash. Its reflection is clearly visible on the specular surface.' },
        { name: 'The Room of Floating Geometric Prisms', prompt: 'A minimalist white room where a single beam of light passes through dozens of floating, translucent prisms, casting vibrant rainbow patterns and caustic effects directly onto the product.' },
        { name: 'The Sand Dune & Shadow Play Room', prompt: 'A studio filled with fine, white sand sculpted into sensuous dunes. A single, harsh light source creates a long, dramatic, and sharp-edged abstract shadow pattern across the landscape, with the product at the focal point.' }
    ],
    'Futuristic & Sci-Fi Scenarios': [
        { name: 'The Sleek Mars Colony Habitation Pod', prompt: 'The interior of a sleek Mars colony pod. The shot looks out a window at the red Martian landscape, while a complex holographic star chart glows next to the product, illuminating it.' },
        { name: 'The Neon-Soaked Cyberpunk Alleyway', prompt: 'A wet, reflective cyberpunk alleyway. The scene is lit by bright pink and blue neon signs in Korean, with steam rising from a vent and reflecting on the wet ground around the product.' },
        { name: 'The \'Solarpunk\' Rooftop Garden', prompt: 'A utopian \'Solarpunk\' rooftop garden. The shot shows the product surrounded by lush vertical gardens, with a clean, futuristic vehicle flying silently in the bright sky above.' },
        { name: 'The Zero-Gravity Space Station Hub', prompt: 'The interior of a zero-gravity space station hub. The product floats weightlessly in the foreground, with small, spherical water droplets suspended nearby, in front of a large window showing a stunning view of Earth.' },
        { name: 'The Bioluminescent Alien Jungle', prompt: 'A mysterious alien jungle at night. The scene is lit by the mysterious, bioluminescent blue and purple glow of exotic, strange and beautiful plants and fungi surrounding the product.' },
        { name: 'The Sleek Hyperloop Train Interior', prompt: 'The minimalist interior of a Hyperloop train. The shot shows the blurred landscape rushing past the window, emphasizing speed, while the product sits in the calm, sleek interior.' },
        { name: 'The Genetic Engineering Laboratory', prompt: 'A high-tech genetic engineering laboratory. The scene is clean and futuristic, with a massive, glowing DNA helix projected in the air behind the product, creating a sense of advanced science.' },
        { name: 'The Command Bridge of a Starship', prompt: 'On the command console of a starship bridge. The shot overlooks a massive viewscreen showing a swirling, colorful nebula, with the ship\'s low lighting focused on the control panels and the product.' },
        { name: 'The Underwater City of Atlantis', prompt: 'A futuristic underwater city. The view is from a balcony inside a glass dome, as a majestic, whale-like creature swims past the glowing architecture in the distance behind the product.' }
    ],
    'Historical & Vintage Eras': [
        { name: 'The Art Deco Speakeasy Bar', prompt: 'A hidden, opulent Art Deco speakeasy bar. The scene features the product next to a classic cocktail glass, with wisps of cigar smoke catching the low, warm light.' },
        { name: 'The 1960s California Case Study House', prompt: 'An iconic Mid-Century Modern house. The scene shows the product on a table next to a classic Eames lounge chair, with a sun-drenched patio and pool visible through floor-to-ceiling glass.' },
        { name: 'The Victorian Explorer\'s Study', prompt: 'A Victorian explorer\'s study. The product is placed on a dark mahogany desk next to a brass globe and a magnifying glass, with hand-drawn maps in the background.' },
        { name: 'The 1980s Neon and Chrome Arcade', prompt: 'A dark 1980s arcade. The shot focuses on the product reflecting the neon lights of a classic arcade cabinet, with game graphics visible on the screen.' },
        { name: 'The Ancient Roman Villa Courtyard', prompt: 'The courtyard of a sunlit ancient Roman villa. The scene is captured with harsh midday sun creating sharp shadows from columns across a mosaic floor, with a marble fountain in the background.' },
        { name: 'The Roaring 50s American Diner', prompt: 'A classic 50s American diner. The product is on a chrome-edged counter next to a tall milkshake, reflecting the glow of the red neon signs.' },
        { name: 'The Elizabethan Theatre Stage', prompt: 'The wooden stage of an Elizabethan theatre. The scene is dramatic, with the product captured in a single spotlight against a backdrop of rich, heavy curtains.' },
        { name: 'The Wild West Saloon', prompt: 'On a polished wooden bar in a classic Wild West saloon. The shot captures the silhouette of a cowboy in the swinging doors in the background, with the scene lit by low, warm oil lamps.' },
        { name: 'An Ancient Egyptian Pharaoh\'s Tomb', prompt: 'Inside a newly discovered pharaoh\'s tomb. The product is among golden artifacts, with the dramatic, flickering light of an explorer\'s torch illuminating a nearby sarcophagus.' },
        { name: 'The 1970s Disco Dance Floor', prompt: 'At the center of a vibrant 1970s disco dance floor. The shot is a long exposure, showing colorful motion trails from dancers around the product, which is illuminated by a spinning disco ball.' }
    ],
    'High-Energy & Motion': [
        { name: 'The Urban Skatepark at Magic Hour', prompt: 'An urban skatepark at magic hour. The shot captures a skater blurred in motion mid-air in the background, with the product in sharp focus against graffiti-covered concrete.' },
        { name: 'The Professional E-Sports Arena Stage', prompt: 'The massive stage of a professional e-sports arena. The product is under intense blue and purple spotlights, with atmospheric haze and gameplay graphics visible on giant LED screens.' },
        { name: 'The Rain-Slicked Formula 1 Pit Lane', prompt: 'A rain-slicked Formula 1 pit lane. The shot captures a car speeding past with motion blur, as mechanics move in a flurry of controlled chaos and sparks fly.' },
        { name: 'The Backstage of a Rock Music Festival', prompt: 'A candid, behind-the-scenes moment backstage at a rock music festival. The product is on a roadie case amidst a tangle of cables, with the bright stage lights spilling in.' },
        { name: 'The Professional Boxing Ring Under Lights', prompt: 'A professional boxing ring. The shot is a dramatic low angle from the canvas, looking up at the product under a single, harsh spotlight in a dark, hazy arena.' },
        { name: 'A World Cup Ski Slalom Course', prompt: 'A World Cup ski slalom course. The shot captures a skater blurred in high-speed motion, spraying a plume of snow into the air as they pass a gate next to the product.' },
        { name: 'A Dirt Bike Rally in the Desert', prompt: 'A desert dirt bike rally. The shot captures a bike kicking up a massive plume of dust against a dramatic setting sun, with the product on a rock in the foreground.' },
        { name: 'The Crest of a Surfing Wave', prompt: 'Conceptually captured on the crest of a massive, curling surfing wave at sunset. The scene is dynamic, with spray flying and the water a brilliant, translucent orange and blue.' },
        { name: 'A Parkour Free-runner\'s Rooftop Leap', prompt: 'Captured mid-moment with a dramatic lens flare from the sun as a parkour athlete leaps between two skyscrapers, with the city below as a dizzying, motion-blurred view.' },
        { name: 'The Eye of a Tornado', prompt: 'A dramatic, conceptual scene from the surprisingly calm eye of a massive tornado. The product sits on the ground as the vortex walls swirl with dust and the debris of a farmhouse.' }
    ],
    'Macro & Texture Focus': [
        { name: 'A Drop of Morning Dew on a Spider\'s Web', prompt: 'An extreme macro shot of a perfect spherical drop of morning dew on an intricate spider\'s web, refracting the golden morning light.' },
        { name: 'Sunlight Through a Glass of Iced Hibiscus Tea', prompt: 'A sensory macro shot focusing on the condensation dripping down a glass of glowing, crimson-colored iced hibiscus tea, with a mint leaf garnish.' },
        { name: 'The Close-up Weave of Raw Selvedge Denim', prompt: 'A macro view of the thick, indigo-dyed cotton threads of raw selvedge denim, with the lighting highlighting the texture and the contrast of the orange stitching.' },
        { name: 'Molten Glass Being Shaped by an Artisan', prompt: 'A conceptual shot capturing the intense, glowing heat and transformation as an artisan\'s tools shape a semi-liquid orb of molten glass.' },
        { name: 'The Frost Patterns on a Window Pane', prompt: 'An extreme close-up of delicate, crystalline frost patterns on a window pane, with the soft morning light filtering through to create a cold, beautiful scene.' },
        { name: 'Bubbles Rising in a Glass of Champagne', prompt: 'A luxurious macro shot of effervescent bubbles rising in a crystal glass, with golden light refracting through the champagne.' },
        { name: 'The Polished Grain of a Rare Wood Burl', prompt: 'A macro view of the intricate, polished grain of a rare wood burl, with lighting that highlights the rich colors and swirling patterns of the natural texture.' },
        { name: 'The Surface of a Geode Crystal', prompt: 'An extreme close-up on the glittering, crystalline surface inside a split-open amethyst geode, with the light creating sparkling refractions off the tiny, purple facets.' },
        { name: 'The Oiled Feathers of a Peacock', prompt: 'A macro shot focusing on the iridescent \'eye\' of a peacock\'s feather, with the lighting angle highlighting the shimmering blue, green, and gold colors.' },
        { name: 'The Cracking Surface of Dried Earth', prompt: 'A close-up of the geometric, cracked patterns of a dried-up riverbed, with a tiny green sprout emerging from one crack, lit by the morning sun.' }
    ],
    'Cultural & Festive Gatherings': [
        { name: 'A Mediterranean Alfresco Dinner Party', prompt: 'A Mediterranean alfresco dinner party. The shot is a close-up of hands reaching for fresh bread on a long wooden table, with string lights and blurred figures in the background.' },
        { name: 'A Lantern-Lit Night Market in Southeast Asia', prompt: 'A vibrant night market in Southeast Asia. The shot focuses on the warm glow of lanterns on the product, with the vibrant colors of spices and the blur of the crowd in the background.' },
        { name: 'A Traditional Japanese Tea Ceremony', prompt: 'A traditional Japanese tea ceremony. The shot focuses on the steam rising from a handcrafted ceramic tea bowl, with the texture of the tatami mat and the grain of the wood visible.' },
        { name: 'The Colorful Dia de los Muertos Ofrenda', prompt: 'A brightly decorated Dia de los Muertos ofrenda. The shot is a close-up, focusing on the product surrounded by marigold flowers and the soft, flickering light of candles.' },
        { name: 'The Rio Carnival Parade Float', prompt: 'A vibrant float in the Rio Carnival parade. The shot captures the energy with confetti frozen in the air around the product, with a backdrop of colorful feathers and bright parade lights.' },
        { name: 'A Holi Festival Celebration in India', prompt: 'The heart of a Holi festival celebration. The scene is joyful and chaotic, with vibrant yellow and pink powders exploding in the air around the clean product.' },
        { name: 'A Classic English Garden Tea Party', prompt: 'An elegant English garden tea party. The shot focuses on the product next to a delicate teacup on a lace tablecloth, with a beautiful blooming rose garden in the soft-focus background.' },
        { name: 'The Running of the Bulls in Pamplona', prompt: 'A scene from the Running of the Bulls. The shot is a dramatic low angle from a safe balcony, showing the product overlooking the narrow street and the red scarves of the runners below.' },
        { name: 'The Yi Peng Lantern Festival in Thailand', prompt: 'A magical night at the Yi Peng Lantern Festival. The shot focuses on the reflection of thousands of glowing paper lanterns in the river, with the product on a platform.' },
        { name: 'A Venetian Masquerade Ball', prompt: 'An opulent and mysterious Venetian masquerade ball. The shot focuses on the intricate detail of a mysterious mask, with the product on a velvet-draped table and blurred dancers in the background.' }
    ],
    'Underground & Subculture Scenes': [
        { name: 'A Berlin Underground Warehouse Rave', prompt: 'A vast, industrial Berlin warehouse rave. The shot captures the product with a dramatic lens flare from a single laser beam cutting through artificial fog and silhouetted dancers.' },
        { name: 'A Secret Library in a Gothic Cathedral', prompt: 'A secret, vaulted library in a gothic cathedral. The shot captures dramatic beams of colored light streaming from a single stained-glass window onto the ancient, leather-bound books.' },
        { name: 'A DIY Punk Show in a Basement', prompt: 'A cramped, low-ceilinged basement during a DIY punk show. The shot is a gritty, candid moment, capturing the motion blur of the crowd under a single bare lightbulb.' },
        { name: 'The Artist\'s Loft After a Painting Session', prompt: 'A chaotic artist\'s loft after a painting session. The shot is a close-up of colorful paint drips on the floor, with the product sitting on a stool having a few stray drops of paint.' },
        { name: 'A Tattoo Artist\'s Studio at Night', prompt: 'A tattoo artist\'s studio late at night. The shot focuses on the gleam of the tattoo machine and the vibrant colors of ink bottles, with flash art on the walls in the background.' },
        { name: 'An Abandoned Subway Station Graffiti Gallery', prompt: 'An abandoned subway station. The shot captures the product against a vibrant, high-concept graffiti piece, with dramatic light shafts coming from grates above.' },
        { name: 'A Spearfishing Trip in a Cenote', prompt: 'An adventurous scene in a mysterious, underwater cenote. The shot captures a spearfisher as a dark silhouette in the water below, with beautiful beams of light piercing the crystal-clear water.' },
        { name: 'An Urban Explorer\'s Derelict Theatre', prompt: 'Inside a beautiful, decaying abandoned theatre. The shot captures dust motes dancing in a single shaft of light that illuminates the product on the otherwise dark stage.' },
        { name: 'A Hacker\'s Code-Filled Lair', prompt: 'A dark room lit only by multiple monitors. The shot focuses on the reflection of cascading green computer code on the product\'s surface, with a tangle of wires on the desk.' },
        { name: 'A Collector\'s Secret Vinyl Record Room', prompt: 'A small, sound-proofed room lined with records. The shot is a moody close-up of the product on a turntable, focusing on the texture of the record\'s grooves and a glowing amplifier tube.' }
    ],
    'Gourmet & Culinary Scenes': [
        { name: 'The Rustic Italian Trattoria Kitchen', prompt: 'A rustic Italian trattoria kitchen. The product is on a wooden cutting board dusted with flour, next to fresh pasta being rolled out and hanging garlic and herbs in the background.' },
        { name: 'The Modern Patisserie Counter', prompt: 'The pristine counter of a French patisserie. The shot is sharp on the product, with rows of colorful and intricate pastries blurred beautifully under clean glass in the background.' },
        { name: 'The Bustling Farmer\'s Market Stall', prompt: 'A bustling farmer\'s market stall. The scene is captured in the early morning light, with the product surrounded by a vibrant arrangement of heirloom tomatoes and leafy greens.' },
        { name: 'The Molecular Gastronomy Lab', prompt: 'A clean, precise molecular gastronomy lab. The shot captures dramatic smoke from dry ice billowing around the product on a minimalist stainless steel surface.' },
        { name: 'A Smoldering BBQ Pit with Hickory Wood', prompt: 'A close-up of a smoldering Texas-style BBQ pit. The shot focuses on the glowing embers and wisps of hickory smoke rising around the product.' },
        { name: 'A High-End Sushi Chef\'s Counter', prompt: 'A minimalist, high-end sushi counter. The shot captures a chef\'s blowtorch searing a piece of fish, with the product sitting cleanly on the light wood counter.' },
        { name: 'A Swiss Chocolatier\'s Workshop', prompt: 'A decadent Swiss chocolatier\'s workshop. The artistic shot captures a stream of tempered liquid chocolate flowing near the product, with scattered cocoa nibs on the counter.' },
        { name: 'A Spanish Tapas Bar', prompt: 'A lively Spanish tapas bar. The shot captures the warm, social atmosphere with the product on a crowded wooden counter alongside a small plate of colorful tapas and a glass of wine.' },
        { name: 'A Traditional English Pub by the Fire', prompt: 'A cozy, traditional English pub on a rainy day. The shot captures the flickering firelight reflecting on the product, which sits next to a pint of ale with condensation.' },
        { name: 'An Open-Air Spice Market in Morocco', prompt: 'A sensory explosion in a Moroccan souk. The shot focuses on the vibrant textures and colors of cone-shaped piles of turmeric and paprika next to the product.' }
    ],
    'Playful & Whimsical Worlds': [
        { name: 'The Enchanted Forest Clearing', prompt: 'A magical clearing in an enchanted forest at twilight. The scene is filled with sparkling fireflies, with the product placed next to a cluster of gently glowing mushrooms.' },
        { name: 'The Candy Land Kingdom', prompt: 'A delicious kingdom made of candy. The shot places the product next to a flowing chocolate river, with lollipop trees and gingerbread houses in the background.' },
        { name: 'The Miniature Toy Soldier Battlefield', prompt: 'A miniature battlefield on a child\'s bedroom floor. The shot shows the product as a giant, mysterious obstacle that a cavalry charge of plastic toy soldiers is navigating around.' },
        { name: 'The Outer Space Cartoon Planet', prompt: 'A colorful and friendly cartoon planet. The shot shows a friendly, googly-eyed alien waving from behind a goofy, colorful crater next to the product.' },
        { name: 'A Steampunk Airship Flying Through Clouds', prompt: 'On the polished wooden deck of a fantastical steampunk airship. The shot is from behind the ship\'s wheel, with spinning brass gears and a view of fluffy clouds at sunset.' },
        { name: 'Inside a Giant\'s Storybook', prompt: 'A whimsical scene where the product is placed inside an oversized, open storybook. The backdrop is a beautiful, classic illustration of a dragon, making the product look miniature.' },
        { name: 'A World Made of LEGO Bricks', prompt: 'A colorful, geometric world constructed entirely from LEGO bricks. The scene is a bustling LEGO city street, with the product placed in a creative and playful composition.' },
        { name: 'A City in the Clouds like Bespin', prompt: 'A majestic city floating in the clouds at sunset. The product is on an elegant balcony overlooking a cityscape of beautiful towers, with the sunset in shades of orange and purple.' },
        { name: 'The World Inside a Snow Globe', prompt: 'A magical scene inside a classic snow globe. The product is on a miniature snowy village landscape, with artificial snow gently falling around it, creating a cozy feel.' },
        { name: 'A Library Where Books Come to Life', prompt: 'An old, magical library. The shot captures a shimmering, magical dragon projection flying out of an open book and circling the bookshelves high above the product.' }
    ],
    'E-commerce & Studio Setups': [
        { name: 'Clean E-commerce White Background', prompt: 'The product is shot on a seamless, pure white (#FFFFFF) cyclorama background. Use even, soft, and shadowless lighting to clearly display all product details for an e-commerce listing.' },
        { name: 'Gradient Background Studio', prompt: 'A clean studio shot of the product against a smooth, modern gradient background transitioning from a soft blue to a gentle pink. The lighting is bright and even.' },
        { name: 'Product on a Pedestal', prompt: 'A minimalist studio shot where the product is placed on a simple geometric pedestal (e.g., a cylinder or cube) made of concrete or marble, against a solid-colored background.' },
        { name: 'Flat Lay Composition', prompt: 'A bird\'s-eye view of the product arranged neatly on a flat surface (like a wooden table or marble countertop) with complementary items, creating a lifestyle narrative.' },
        { name: 'Reflective Surface Studio', prompt: 'The product is placed on a glossy, reflective black surface, creating a perfect, mirror-like reflection underneath it. The scene is lit with soft, dramatic studio lights.' },
        { name: 'Group Product Shot', prompt: 'An elegant composition of multiple product variations (e.g., different colors or sizes) arranged together in a clean studio setting to showcase the entire product line.' },
        { name: 'Suspended in Mid-Air', prompt: 'A dynamic studio shot where the product is frozen in mid-air, as if weightless, against a clean background. This creates a sense of lightness and magic.' },
        { name: 'With Natural Elements', prompt: 'A clean studio shot incorporating natural elements like a single monstera leaf, smooth river stones, or a trickle of water to add an organic, fresh feel.' },
        { name: 'Hard Light & Shadow Play', prompt: 'A modern studio shot using a single, hard light source to cast sharp, graphic, and elongated shadows from the product, creating a high-fashion, dramatic look.' },
        { name: 'Textured Studio Background', prompt: 'The product is shot against a richly textured studio background, such as handmade paper, raw linen fabric, or a chiseled slab of stone, to add tactile depth.' }
    ],
    'Human Interaction & In-Use Scenarios': [
        { name: 'Hands Interacting with Product', prompt: 'A close-up, point-of-view shot focusing on a pair of well-manicured hands holding, opening, or using the product, demonstrating its function and scale.' },
        { name: 'Lifestyle with Person', prompt: 'A candid, in-use lifestyle shot where a person in a bright, welcoming setting is interacting with the product, showing a positive experience.' },
        { name: 'At a Crowded Event', prompt: 'The product is being used by someone in a crowded but blurred-out setting like a concert or a sports game, showing its utility in real-world, high-energy scenarios.' },
        { name: 'Professional at Work', prompt: 'The product is shown as an essential tool in a professional\'s workspace, such as a designer using it on their desk or a chef in their kitchen.' },
        { name: 'Family Moment', prompt: 'A heartwarming scene where the product is part of a family activity, like being used during a board game night or a picnic in the park.' },
        { name: 'The Gift Exchange', prompt: 'A close-up shot focusing on the hands of one person giving the product (either packaged or unpackaged) to another, evoking a sense of generosity and special occasions.' },
        { name: '‘What\'s In My Bag’ Flat Lay', prompt: 'A top-down flat lay of the contents of a person\'s bag (e.g., a purse, a gym bag, a briefcase), with the product positioned as a key item among other personal effects that define a user\'s persona.' },
        { name: 'Care and Maintenance', prompt: 'A detailed shot of hands carefully cleaning, polishing, or maintaining the product, emphasizing its quality, durability, and the owner\'s pride in it.' },
        { name: 'A Shared Experience', prompt: 'Two people (friends, a couple) are shown enjoying the product together. For example, two people wearing headphones and smiling, sharing a moment.' },
        { name: 'The First Impression', prompt: 'A shot capturing the genuine, positive expression (e.g., awe, excitement, delight) on a person\'s face as they see or use the product for the very first time.' }
    ],
    'Seasonal & Holiday Themes': [
        { name: 'Cozy Christmas Morning', prompt: 'A warm, festive scene where the product is presented as a gift under a decorated Christmas tree. The background features twinkling lights creating beautiful bokeh, with wrapping paper and ribbons nearby.' },
        { name: 'Spooky Halloween Night', prompt: 'A moody, atmospheric shot with the product placed amongst carved pumpkins, autumn leaves, and subtle fog, lit by the flickering glow of a candle.' },
        { name: 'Vibrant Summer Beach Day', prompt: 'A bright, high-energy shot of the product on a clean, sandy beach next to sunglasses and a towel, with the turquoise ocean and blue sky in the background.' },
        { name: 'Fresh Spring Garden', prompt: 'A clean and vibrant shot of the product surrounded by fresh spring flowers like tulips and daffodils, with soft morning light and dewdrops.' },
        { name: 'Warm Autumn Afternoon', prompt: 'A cozy scene with the product on a rustic wooden surface, surrounded by crisp autumn leaves, a steaming mug, and a plaid blanket.' },
    ],
    'Material & Texture Transformations': [
        { name: 'Carved from Polished Marble', prompt: 'Re-imagine the product as if it were meticulously carved from a single block of polished Carrara marble. Use studio lighting to highlight the intricate veining and smooth, cool texture of the stone.' },
        { name: 'Forged from Rough Iron', prompt: 'The product appears to be hand-forged from rough, blackened iron, with visible hammer marks and a rugged, industrial texture. Lit dramatically from the side.' },
        { name: 'Grown from Natural Wood', prompt: 'The product is seamlessly integrated with the grain of a piece of natural, unstained wood, as if it grew organically from the material itself.' },
        { name: 'Cast in Translucent Glass', prompt: 'The product is rendered as a beautiful object of colored, translucent glass, with light from behind creating a glowing, ethereal effect and internal refractions.' },
        { name: 'Woven from Natural Fibers', prompt: 'A macro shot that re-imagines the product\'s surface as being woven from natural fibers like wicker or jute, emphasizing a rustic, handcrafted texture.' },
    ],
    'Conceptual & Metaphorical Scenes': [
        { name: 'Floating in a Minimalist Void', prompt: 'The product floats weightlessly in the center of a minimalist, empty void, lit by a single soft light source, creating a sense of purity, focus, and elegance.' },
        { name: 'Breaking Through a Barrier', prompt: 'A powerful, dynamic shot where the product is captured mid-motion, shattering a sheet of glass or breaking through a solid wall, symbolizing disruption and power.' },
        { name: 'A Fresh Splash of Water', prompt: 'A high-speed photograph capturing a clean, dynamic splash of crystal-clear water frozen in time as it collides with or envelops the product, signifying freshness and purity.' },
        { name: 'The Center of a Maze', prompt: 'A bird\'s-eye view of the product placed at the center of a complex, geometric maze or labyrinth, representing a solution, a goal, or clarity.' },
        { name: 'Illuminated by an Idea', prompt: 'The product is in a dark space, illuminated only by the bright, conceptual glow of a classic lightbulb or a streak of light, symbolizing innovation and ideas.' },
    ],
    'Packaging & Unboxing Moments': [
        { name: 'Product with Premium Packaging', prompt: 'A sophisticated shot of the product positioned next to its elegant, high-quality packaging (box, bag, etc.), often with materials like silk, wood shavings, or custom tissue paper.' },
        { name: 'The Unboxing Moment', prompt: 'A point-of-view shot of hands in the process of opening the product\'s packaging for the first time, creating a sense of anticipation and excitement.' },
        { name: 'Deconstructed Packaging', prompt: 'An artistic flat lay showing the product and all of its packaging components (the box, insert, manual, wrapping) arranged neatly in a deconstructed, organized manner.' },
    ],
    'Technical & Exploded Views': [
        { name: 'Exploded View', prompt: 'A technical illustration showing the product deconstructed with its components seemingly floating in space but perfectly aligned, revealing its internal complexity and craftsmanship.' },
        { name: 'Cross-Section Cutaway', prompt: 'A view of the product that has been digitally cut in half to show the internal workings, layers, and materials in a clean, technical style.' },
        { name: 'Holographic Wireframe', prompt: 'The product is represented as a glowing, futuristic 3D wireframe or holographic projection, emphasizing its design, technology, and structure.' },
    ],
};
export const PHOTOGRAPHIC_DIRECTIONS = {
    'Camera Angle': [
        { name: 'Eye-Level', prompt: 'An eye-level shot' },
        { name: 'Low Angle', prompt: 'A dramatic low-angle shot' },
        { name: 'High Angle', prompt: 'A high-angle shot looking down' },
        { name: 'Dutch Angle', prompt: 'A dynamic dutch-angle shot' },
        { name: 'Bird\'s-Eye View', prompt: 'A bird\'s-eye view looking straight down at the product' },
        { name: 'Worm\'s-Eye View', prompt: 'A worm\'s-eye view, looking up from the ground' }
    ],
    'Shot Type': [
        { name: 'Extreme Wide', prompt: 'An extreme wide shot showing the product within the vast landscape' },
        { name: 'Wide Shot', prompt: 'A wide shot of the product' },
        { name: 'Medium Shot', prompt: 'A medium shot of the product' },
        { name: 'Close-Up', prompt: 'A close-up shot focusing on' },
        { name: 'Macro Shot', prompt: 'An extreme macro shot of the product\'s texture' },
        { name: 'POV', prompt: 'A point-of-view shot, as if the user is holding' },
        { name: 'Over-the-Shoulder', prompt: 'An over-the-shoulder shot looking towards the product' }
    ],
    'Lighting': [
        { name: 'Soft, Diffused', prompt: 'bathed in soft, diffused window light.' },
        { name: 'Hard, Direct', prompt: 'lit by a single source of hard, direct light, creating dramatic shadows.' },
        { name: 'Golden Hour', prompt: 'captured during the golden hour, with warm, long shadows.' },
        { name: 'Blue Hour', prompt: 'captured during the blue hour, with a cool, moody atmosphere.' },
        { name: 'Three-Point', prompt: 'using professional three-point studio lighting.' },
        { name: 'Rim Lighting', prompt: 'dramatically backlit, creating a bright rim of light around the product\'s silhouette.' },
        { name: 'Neon', prompt: 'illuminated by the vibrant glow of pink and blue neon signs.' },
        { name: 'Caustic', prompt: 'with shimmering caustic light patterns reflecting on the scene.' }
    ],
    'Composition': [
        { name: 'Rule of Thirds', prompt: 'A composition using the rule of thirds, placing the product on the right' },
        { name: 'Symmetrical', prompt: 'A perfectly centered and symmetrical composition' },
        { name: 'Leading Lines', prompt: 'using the road as a leading line to guide the eye to the product.' },
        { name: 'Framing', prompt: 'framed by out-of-focus leaves in the foreground.' },
        { name: 'Negative Space', prompt: 'A minimalist composition with a large area of negative space around the product' },
        { name: 'Golden Ratio', prompt: 'composed along a golden ratio spiral, leading the eye to the product.' },
        { name: 'Layers', prompt: 'A composition with deep layers, showing foreground elements, the product in the middle-ground, and a distant background.' }
    ],
    'Focus': [
        { name: 'Deep Depth of Field', prompt: 'shot with a deep depth of field, keeping the entire scene in sharp focus.' },
        { name: 'Shallow Depth of Field', prompt: 'shot with a very shallow depth of field, creating a beautifully blurred background.' },
        { name: 'Rack Focus', prompt: 'with the focus pulling from the background to the product in the foreground.' },
        { name: 'Tilt-Shift', prompt: 'shot with a tilt-shift effect, making the scene look like a miniature model.' },
        { name: 'Soft Focus', prompt: 'a dreamy, soft-focus effect applied to the entire image.' },
        { name: 'Lens Flare', prompt: 'with a dramatic, cinematic lens flare from the sun.' }
    ],
    'Color & Palette': [
        { name: 'Monochromatic Palette', prompt: 'using a cool, monochromatic blue color palette.' },
        { name: 'Analogous Palette', prompt: 'a harmonious analogous color palette of yellows, greens, and blues.' },
        { name: 'Complementary Palette', prompt: 'a dynamic composition using the complementary colors of orange and blue.' },
        { name: 'Triadic Palette', prompt: 'a vibrant triadic color scheme of purple, green, and orange.' },
        { name: 'Desaturated / Muted Tones', prompt: 'a desaturated and muted color palette for a moody, cinematic feel.' },
        { name: 'High Saturation / Vibrant Tones', prompt: 'a highly saturated and vibrant color palette for an energetic feel.' }
    ],
    'Camera & Film Emulation': [
        { name: 'Classic Polaroid 600', prompt: 'photo taken on a Polaroid 600 camera, with its characteristic soft focus and faded colors.' },
        { name: 'Fujifilm Velvia Film', prompt: 'shot on Fujifilm Velvia film, emphasizing vivid, saturated colors and high contrast.' },
        { name: 'Kodak Portra 400 Film', prompt: 'shot on Kodak Portra 400 film, with warm tones, rich color, and a cinematic quality.' },
        { name: 'Sony Alpha Digital', prompt: 'a clean, ultra-sharp photograph shot on a Sony Alpha camera.' },
        { name: 'Leica M-Series Look', prompt: 'a photograph with the character and timeless quality of a Leica M-series camera.' },
        { name: 'Lomography Lomo-LCA', prompt: 'a lomography photo with heavy vignetting, high contrast, and super-saturated colors.' },
        { name: 'Disposable Camera with Flash', prompt: 'a nostalgic photo taken on a disposable camera with a harsh direct flash and grainy texture.' },
        { name: 'Wet Plate Collodion Photo', prompt: 'an antique wet plate collodion photograph, with its characteristic ethereal quality and imperfections.' }
    ]
};
export const GENERATIVE_FILL_PRESETS = {
  Lighting: [ "Golden Hour", "Studio Lighting", "Neon Glow", "Cinematic Lighting" ],
  "Time of Day": [ "Sunrise", "Midday Sun", "Sunset", "Night Time" ],
};
export const ANIMATION_PRESETS = [
    { name: 'Subtle Ambiance', prompt: 'Create a subtle ambiance with gentle motion in the background (e.g., steam rising, leaves rustling, clouds drifting).' },
    { name: 'Product Spotlight', prompt: 'Create a slow, elegant 360-degree rotation of the product.' },
    { name: '3D Photo Parallax', prompt: 'Generate a subtle 3D parallax camera pan effect, giving the image a sense of depth.' },
];