/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import { VISUAL_STYLES, CUSTOM_BACKGROUNDS, PHOTOGRAPHIC_DIRECTIONS, GENERATIVE_FILL_PRESETS, ANIMATION_PRESETS } from './constants';
import type { ProductImage, SelectedBackground, GeneratedImage, Preset, Project, VisualStyle, DirectionCategory } from './types';


declare const JSZip: any;

const MAX_IMAGES = 10;
const MAX_PRODUCT_IMAGES = 5;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  // Project-based State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // UI/Interaction State
  const [currentStep, setCurrentStep] = useState(1);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fullPreviewImage, setFullPreviewImage] = useState<GeneratedImage | null>(null);
  const [expandedReviewItem, setExpandedReviewItem] = useState<string | null>(null);
  const [shareData, setShareData] = useState<{ name: string; images: GeneratedImage[] } | null>(null);

  // Loading State
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [upscalingId, setUpscalingId] = useState<string | null>(null);
  const [variationsLoadingId, setVariationsLoadingId] = useState<string | null>(null);
  const [isGeneratingFill, setIsGeneratingFill] = useState(false);
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
  const [isUncropping, setIsUncropping] = useState(false);
  const [isGeneratingIdeaFor, setIsGeneratingIdeaFor] = useState<string | null>(null);
  const [isGeneratingDetailedPrompt, setIsGeneratingDetailedPrompt] = useState(false);
  
  // Advanced Features State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [generativeFillPrompt, setGenerativeFillPrompt] = useState("");
  const [imageAdjustments, setImageAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  const [uncropAspectRatio, setUncropAspectRatio] = useState("1:1");
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [brushSize, setBrushSize] = useState(40);
  const [isErasing, setIsErasing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [promptGeneratorImage, setPromptGeneratorImage] = useState<GeneratedImage | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [showAnimationModal, setShowAnimationModal] = useState(false);
  const [animatingImage, setAnimatingImage] = useState<GeneratedImage | null>(null);
  const [animationPrompt, setAnimationPrompt] = useState("");
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);
  const [animationAspectRatio, setAnimationAspectRatio] = useState("1:1");

  // Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLImageElement>(null);

  // --- DATA MANAGEMENT ---

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('projects');
      const loadedProjects = savedProjects ? JSON.parse(savedProjects) : [];
      setProjects(loadedProjects);

      const lastActiveId = localStorage.getItem('activeProjectId');
      if (lastActiveId && loadedProjects.some((p: Project) => p.id === lastActiveId)) {
        setActiveProjectId(lastActiveId);
      }

      const savedPresets = localStorage.getItem('presets');
      setPresets(savedPresets ? JSON.parse(savedPresets) : []);
    } catch (e) {
      console.error("Failed to load data from local storage", e);
      setProjects([]);
      setPresets([]);
    }
  }, []);

  useEffect(() => {
    try {
      const savableProjects = projects.filter(p => p.name !== 'Untitled Project' || p.productImages.length > 0 || p.generatedImages.length > 0);
      localStorage.setItem('projects', JSON.stringify(savableProjects));
    } catch (e) {
      console.error("Failed to save projects to local storage", e);
    }
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('activeProjectId', activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    try {
      localStorage.setItem('presets', JSON.stringify(presets));
    } catch (e) {
      console.error("Failed to save presets to local storage", e);
    }
  }, [presets]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const productImages = activeProject?.productImages ?? [];
  const selectedStyle = activeProject?.selectedStyle ?? null;
  const selectedBackgrounds = activeProject?.selectedBackgrounds ?? [];
  const generatedImages = activeProject?.generatedImages ?? [];

  const totalImageCount = selectedBackgrounds.reduce((acc, bg) => acc + bg.count, 0) * productImages.filter(img => img.isProcessed).length;
  
  // --- CORE LOGIC ---
  const performProjectUpdate = useCallback((updateFn: (project: Project) => Project) => {
    const currentActiveId = activeProjectId;
    
    // Case 1: We have a valid, active project. Update it.
    if (currentActiveId && projects.some(p => p.id === currentActiveId)) {
        setProjects(currentProjects =>
            currentProjects.map(p =>
                p.id === currentActiveId ? updateFn(p) : p
            )
        );
        return;
    }

    // Case 2: No active project. Create one, apply the update, and set it as active.
    const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: `Untitled Project`,
        createdAt: new Date().toISOString(),
        productImages: [],
        selectedStyle: null,
        selectedBackgrounds: [],
        generatedImages: [],
    };
    
    const updatedProject = updateFn(newProject);

    setProjects(currentProjects => [...currentProjects, updatedProject]);
    setActiveProjectId(newProject.id);

}, [activeProjectId, projects]);

  const fileToGenerativePart = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        mimeType: file.type,
        data: base64,
      },
    };
  };

  const sanitizeForFilename = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/\.[^/.]+$/, "") // remove file extension
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .trim()
        .replace(/\s+/g, '_') // replace spaces with underscores
        .slice(0, 50); // limit length
  };
  
  // --- EVENT HANDLERS ---

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (!files) return;
    setIsUploading(true);
    setError(null);
    try {
      const newImages: ProductImage[] = await Promise.all(
        Array.from(files).map(async file => {
          const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          return {
            id: `img-${Date.now()}-${Math.random()}`,
            originalName: file.name,
            data,
            mimeType: file.type,
          };
        })
      );
      
      performProjectUpdate(project => {
        const updatedImages = [...project.productImages, ...newImages];
        return { ...project, productImages: updatedImages.slice(0, MAX_PRODUCT_IMAGES) };
      });

      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setError('Error reading files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [performProjectUpdate]);

  const handleRemoveProductImage = useCallback((imageId: string) => {
    if (window.confirm('Are you sure you want to remove this product image?')) {
        performProjectUpdate(project => ({
            ...project,
            productImages: project.productImages.filter(img => img.id !== imageId),
        }));
    }
}, [performProjectUpdate]);

  const handleReprocessImage = useCallback((imageId: string) => {
    setIsRemovingBackground(imageId);
    setError(null);

    const image = productImages.find(img => img.id === imageId);
    if (!image) return;

    (async () => {
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: image.data.split(',')[1],
                    mimeType: image.mimeType,
                  },
                },
                { text: 'Segment the main object from the background and make the background transparent.' },
              ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
          });
        
          const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);

          if (imagePart && imagePart.inlineData) {
            const processedData = `data:image/png;base64,${imagePart.inlineData.data}`;
            performProjectUpdate(project => ({
                ...project,
                productImages: project.productImages.map(img =>
                    img.id === imageId ? { ...img, processedData, isProcessed: true } : img
                ),
            }));
          } else {
            throw new Error('No image was returned from the API.');
          }

      } catch (err) {
        console.error(err);
        setError(`Failed to process image ${image.originalName}. Please try again.`);
        performProjectUpdate(project => ({
            ...project,
            productImages: project.productImages.map(img =>
                img.id === imageId ? { ...img, isProcessed: false } : img
            ),
        }));
      } finally {
        setIsRemovingBackground(null);
      }
    })();
  }, [productImages, performProjectUpdate]);

  const handleSkipProcessing = useCallback(() => {
    performProjectUpdate(project => ({
        ...project,
        productImages: project.productImages.map(img => 
            img.isProcessed ? img : { ...img, isProcessed: true }
        )
    }));
    setCurrentStep(3);
  }, [performProjectUpdate]);

  const handleStyleSelect = useCallback((style: VisualStyle) => {
    performProjectUpdate(project => ({ ...project, selectedStyle: style }));
    setCurrentStep(4);
  }, [performProjectUpdate]);

  const handleAddCustomBackground = useCallback(() => {
    if (!customPrompt.trim()) return;
    performProjectUpdate(project => {
      const newBg = {
        id: `bg-${Date.now()}`,
        name: customPrompt.trim(),
        prompt: customPrompt.trim(),
        count: 1,
        directions: {},
        matchPalette: false,
        negativePrompt: '',
      };
      return { ...project, selectedBackgrounds: [...project.selectedBackgrounds, newBg] };
    });
    setCustomPrompt('');
  }, [customPrompt, performProjectUpdate]);

  const handleBackgroundSelect = useCallback((bg: { name: string; prompt: string }) => {
    performProjectUpdate(project => {
        const existingBg = project.selectedBackgrounds.find(b => b.prompt === bg.prompt);
        if (existingBg) {
          return {
            ...project,
            selectedBackgrounds: project.selectedBackgrounds.map(b =>
              b.id === existingBg.id ? { ...b, count: b.count + 1 } : b
            ),
          };
        } else {
          const newBg = {
            id: `bg-${Date.now()}`,
            name: bg.name,
            prompt: bg.prompt,
            count: 1,
            directions: {},
            matchPalette: false,
            negativePrompt: '',
          };
          return { ...project, selectedBackgrounds: [...project.selectedBackgrounds, newBg] };
        }
      });
  }, [performProjectUpdate]);

  const handleBackgroundCountChange = useCallback((id: string, delta: number) => {
    performProjectUpdate(project => ({
      ...project,
      selectedBackgrounds: project.selectedBackgrounds.map(bg =>
        bg.id === id ? { ...bg, count: Math.max(1, Math.min(MAX_IMAGES, bg.count + delta)) } : bg
      ),
    }));
  }, [performProjectUpdate]);

  const handleRemoveBackground = useCallback((id: string) => {
    performProjectUpdate(project => ({
      ...project,
      selectedBackgrounds: project.selectedBackgrounds.filter(bg => bg.id !== id),
    }));
  }, [performProjectUpdate]);
  
  const handleClearBackgrounds = useCallback(() => {
    performProjectUpdate(project => ({ ...project, selectedBackgrounds: [] }));
  }, [performProjectUpdate]);

  const handleUpdateDirections = useCallback((bgId: string, category: DirectionCategory, value: string | null) => {
    performProjectUpdate(project => ({
      ...project,
      selectedBackgrounds: project.selectedBackgrounds.map(bg =>
        bg.id === bgId
          ? {
              ...bg,
              directions: {
                ...bg.directions,
                [category]: bg.directions[category] === value ? null : value,
              },
            }
          : bg
      ),
    }));
  }, [performProjectUpdate]);

  const handleUpdateMatchPalette = useCallback((bgId: string, checked: boolean) => {
    performProjectUpdate(project => ({
      ...project,
      selectedBackgrounds: project.selectedBackgrounds.map(bg =>
        bg.id === bgId ? { ...bg, matchPalette: checked } : bg
      ),
    }));
  }, [performProjectUpdate]);

  const handleUpdateNegativePrompt = useCallback((bgId: string, value: string) => {
    performProjectUpdate(project => ({
      ...project,
      selectedBackgrounds: project.selectedBackgrounds.map(bg =>
        bg.id === bgId ? { ...bg, negativePrompt: value } : bg
      ),
    }));
  }, [performProjectUpdate]);
  
  const handleGenerate = useCallback(async () => {
    if (!selectedStyle) return;
    setIsGenerating(true);
    setError(null);
    
    const imagesToGenerate = productImages.filter(img => img.isProcessed);

    try {
      const allGenerationPromises = imagesToGenerate.flatMap(image =>
        selectedBackgrounds.flatMap(background => {
          const fullPrompt = [
            selectedStyle.prompt,
            background.prompt,
            ...Object.values(background.directions).filter(Boolean),
            background.negativePrompt ? `avoiding: ${background.negativePrompt}` : '',
          ].join(', ');
          
          const hasTransparentBg = !!image.processedData;
          const imageData = (image.processedData || image.data).split(',')[1];
          const imageMimeType = hasTransparentBg ? 'image/png' : image.mimeType;

          const generationPrompt = hasTransparentBg
            ? `Place the product from the image into the following scene, maintaining the product's appearance: ${fullPrompt}. The product has a transparent background.`
            : `Integrate the main product from the provided image into a new scene described as: ${fullPrompt}. The product should be realistically placed within the new background, replacing its original surroundings.`;

          return Array.from({ length: background.count }, (_, i) =>
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                  parts: [
                    {
                      inlineData: {
                        data: imageData,
                        mimeType: imageMimeType
                      }
                    },
                    {
                      text: generationPrompt
                    }
                  ]
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                }
            }).then(response => {
              const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);

              if (imagePart && imagePart.inlineData) {
                return {
                  id: `gen-${Date.now()}-${Math.random()}`,
                  sourceId: image.id,
                  data: `data:image/png;base64,${imagePart.inlineData.data}`,
                  mimeType: 'image/png',
                  prompt: fullPrompt,
                  backgroundName: background.name,
                };
              }
              return null;
            }).catch(err => {
              console.error(`Generation failed for prompt: ${fullPrompt}`, err);
              return null; // Return null on failure to not break Promise.all
            })
          );
        })
      );

      const newImages = (await Promise.all(allGenerationPromises)).filter((img): img is GeneratedImage => img !== null);
      
      if (newImages.length === 0) {
        throw new Error("Image generation failed for all requests. Please check the console for details.");
      }

      performProjectUpdate(project => ({
        ...project,
        generatedImages: [...project.generatedImages, ...newImages],
      }));

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedStyle, productImages, selectedBackgrounds, performProjectUpdate]);

  const handleResetApp = useCallback(() => {
    if (window.confirm('Are you sure you want to start over? This will clear everything.')) {
        localStorage.clear();
        window.location.reload();
    }
}, []);

  const handleCreateProject = useCallback((name: string) => {
    const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: name,
        createdAt: new Date().toISOString(),
        productImages: [],
        selectedStyle: null,
        selectedBackgrounds: [],
        generatedImages: [],
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowProjectsModal(false);
    setCurrentStep(1);
  }, []);

  const handleLoadProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setShowProjectsModal(false);
    const project = projects.find(p => p.id === projectId);
    if (project) {
        if (project.generatedImages.length > 0) setCurrentStep(5);
        else if (project.selectedBackgrounds.length > 0) setCurrentStep(4);
        else if (project.selectedStyle) setCurrentStep(4);
        else if (project.productImages.length > 0) setCurrentStep(2);
        else setCurrentStep(1);
    }
  }, [projects]);
  
  const handleDeleteProject = useCallback((projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (activeProjectId === projectId) {
            setActiveProjectId(null);
            setCurrentStep(1);
        }
    }
  }, [activeProjectId]);

  const handleUpscale = useCallback(async (imageId: string) => {
    setUpscalingId(imageId);
    const image = generatedImages.find(img => img.id === imageId);
    if (!image) return;

    // Simulate upscaling as this model doesn't have a native upscale feature
    // We'll regenerate at a potentially higher quality setting
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: image.prompt + ', 4k, high resolution, photorealistic',
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
            },
        });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const upscaledImage = response.generatedImages[0];
        const newData = `data:image/jpeg;base64,${upscaledImage.image.imageBytes}`;
        performProjectUpdate(project => ({
          ...project,
          generatedImages: project.generatedImages.map(img =>
            img.id === imageId ? { ...img, data: newData, prompt: image.prompt + ', 4k, high resolution, photorealistic' } : img
          ),
        }));
      }
    } catch (error) {
        console.error("Upscale failed", error);
        setError("Failed to upscale image.");
    } finally {
        setUpscalingId(null);
    }
  }, [generatedImages, performProjectUpdate]);

  const handleGenerateVariations = useCallback(async (imageId: string) => {
    setVariationsLoadingId(imageId);
    const image = generatedImages.find(img => img.id === imageId);
    if (!image) return;
  
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: image.prompt,
            config: {
                numberOfImages: 4,
                outputMimeType: 'image/jpeg',
            },
        });
  
      if (response.generatedImages && response.generatedImages.length > 0) {
        const newVariations: GeneratedImage[] = response.generatedImages.map(genImg => ({
          id: `gen-${Date.now()}-${Math.random()}`,
          sourceId: image.sourceId,
          data: `data:image/jpeg;base64,${genImg.image.imageBytes}`,
          mimeType: 'image/jpeg',
          prompt: image.prompt,
          backgroundName: image.backgroundName,
        }));
        performProjectUpdate(project => ({
          ...project,
          generatedImages: [...project.generatedImages, ...newVariations],
        }));
      }
    } catch (error) {
      console.error("Variation generation failed", error);
      setError("Failed to generate variations.");
    } finally {
      setVariationsLoadingId(null);
    }
  }, [generatedImages, performProjectUpdate]);

  const handleDownloadImage = useCallback((image: GeneratedImage) => {
    if (!activeProject) return;
    const sourceImage = productImages.find(p => p.id === image.sourceId);

    const productName = sanitizeForFilename(sourceImage?.originalName ?? 'product');
    const styleName = sanitizeForFilename(activeProject.selectedStyle?.name ?? 'style');
    const backgroundName = sanitizeForFilename(image.backgroundName ?? 'background');
    const imageId = image.id.slice(-6);

    const extension = image.mimeType.split('/')[1] ?? 'png';
    const filename = `${productName}_${styleName}_${backgroundName}_${imageId}.${extension}`;

    const link = document.createElement('a');
    link.href = image.data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activeProject, productImages]);

  const handleDownloadAll = useCallback(async () => {
    if (!activeProject || generatedImages.length === 0) return;

    const zip = new JSZip();
    const folderName = sanitizeForFilename(activeProject.name);
    const folder = zip.folder(folderName);

    if (folder) {
        await Promise.all(
            generatedImages.map(async (image) => {
                const sourceImage = productImages.find(p => p.id === image.sourceId);

                const productName = sanitizeForFilename(sourceImage?.originalName ?? 'product');
                const styleName = sanitizeForFilename(activeProject.selectedStyle?.name ?? 'style');
                const backgroundName = sanitizeForFilename(image.backgroundName ?? 'background');
                const imageId = image.id.slice(-6);

                const extension = image.mimeType.split('/')[1] ?? 'png';
                const baseFilename = `${productName}_${styleName}_${backgroundName}_${imageId}`;
                const imageFilename = `${baseFilename}.${extension}`;
                
                // Add image
                const response = await fetch(image.data);
                const blob = await response.blob();
                folder.file(imageFilename, blob);

                // Add metadata
                const metadata = [
                    `Product Name: ${sourceImage?.originalName ?? 'N/A'}`,
                    `Visual Style: ${activeProject.selectedStyle?.name ?? 'N/A'}`,
                    `Background Scene: ${image.backgroundName ?? 'N/A'}`,
                    `Generated At: ${new Date().toISOString()}`,
                    ``,
                    `Full Prompt:`,
                    image.prompt,
                ].join('\n');
                
                folder.file(`${baseFilename}_metadata.txt`, metadata);
            })
        );
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}_collection.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}, [generatedImages, activeProject, productImages]);

const handleEditWithPreset = useCallback(async (preset: string) => {
    if (!editingImage) return;
    setIsGeneratingFill(true);
    setGenerativeFillPrompt(preset);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: editingImage.data.split(',')[1],
                mimeType: editingImage.mimeType,
              },
            },
            { text: preset },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

      const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);
      if (imagePart && imagePart.inlineData) {
        const editedData = `data:image/png;base64,${imagePart.inlineData.data}`;
        performProjectUpdate(project => ({
            ...project,
            generatedImages: project.generatedImages.map(img =>
                img.id === editingImage.id ? { ...img, data: editedData } : img
            ),
        }));
        setEditingImage(prev => prev ? { ...prev, data: editedData } : null);
      }
    } catch (error) {
      console.error("Generative fill failed", error);
      setError("Failed to apply generative fill.");
    } finally {
      setIsGeneratingFill(false);
    }
  }, [editingImage, performProjectUpdate]);

  const handleUncrop = useCallback(async () => {
    if (!editingImage) return;
    setIsUncropping(true);
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: editingImage.data.split(',')[1],
                mimeType: editingImage.mimeType,
              },
            },
            { text: `Uncrop this image to a ${uncropAspectRatio} aspect ratio.` },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

      const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);
      if (imagePart && imagePart.inlineData) {
        const uncroppedData = `data:image/png;base64,${imagePart.inlineData.data}`;
        performProjectUpdate(project => ({
            ...project,
            generatedImages: project.generatedImages.map(img =>
                img.id === editingImage.id ? { ...img, data: uncroppedData } : img
            ),
        }));
        setEditingImage(prev => prev ? { ...prev, data: uncroppedData } : null);
      }
    } catch (error) {
      console.error("Uncrop failed", error);
      setError("Failed to uncrop image.");
    } finally {
      setIsUncropping(false);
    }
  }, [editingImage, uncropAspectRatio, performProjectUpdate]);

  const handleGenerateDetailedPromptForImage = useCallback(async (image: GeneratedImage, type: 'short' | 'long') => {
    setPromptGeneratorImage(image);
    setShowPromptGenerator(true);
    setIsGeneratingPrompt(true);
    setGeneratedPrompt("");
    try {
        const prompt = type === 'short'
            ? 'Describe this image in one sentence for a text-to-image model.'
            : 'Describe this image in detail. Be specific about the subject, composition, lighting, and style. Write it as a prompt for a text-to-image model.';
        
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                  parts: [
                    {
                      inlineData: {
                        data: image.data.split(',')[1],
                        mimeType: image.mimeType,
                      },
                    },
                    { text: prompt },
                  ],
                },
              });

        setGeneratedPrompt(response.text.trim());
    } catch (error) {
        console.error('Prompt generation failed', error);
        setError('Could not generate a prompt for this image.');
        setShowPromptGenerator(false);
    } finally {
        setIsGeneratingPrompt(false);
    }
}, []);

  const handleAnimate = useCallback(async () => {
    if (!animatingImage) return;
    setIsGeneratingAnimation(true);
    
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: animationPrompt || 'Animate this image with subtle motion.',
        image: {
            imageBytes: animatingImage.data.split(',')[1],
            mimeType: animatingImage.mimeType
        },
        config: {
            numberOfVideos: 1,
            aspectRatio: animationAspectRatio
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        performProjectUpdate(project => ({
            ...project,
            generatedImages: project.generatedImages.map(img => 
                img.id === animatingImage.id ? { ...img, videoUrl: downloadLink, isGeneratingVideo: false } : img
            )
        }));
    } else {
        setError("Video generation failed or returned no link.");
        performProjectUpdate(project => ({
            ...project,
            generatedImages: project.generatedImages.map(img => 
                img.id === animatingImage.id ? { ...img, isGeneratingVideo: false } : img
            )
        }));
    }
    
    setIsGeneratingAnimation(false);
    setShowAnimationModal(false);
  }, [animatingImage, animationPrompt, animationAspectRatio, performProjectUpdate]);

  const theme = document.documentElement.getAttribute('data-theme');
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  const handleOpenAnimationModal = (image: GeneratedImage) => {
    setAnimatingImage(image);
    setAnimationPrompt("");
    setShowAnimationModal(true);
  };

  const handleCarouselScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleGenerateIdea = async (category: string) => {
    setIsGeneratingIdeaFor(category);
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate one new, creative, and specific photo background idea for a product photoshoot. The category is "${category}". The idea should be described in a single sentence, similar in style to the existing ideas.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'A short, evocative name for the scene (e.g., "The Artisan\'s Workshop").' },
                        prompt: { type: Type.STRING, description: 'A detailed, one-sentence prompt describing the scene for an image model.' }
                    },
                    propertyOrdering: ['name', 'prompt'],
                }
            }
        });
      
      const idea = JSON.parse(response.text);

      if (idea.name && idea.prompt) {
        handleBackgroundSelect(idea);
      }
    } catch (error) {
      console.error('Failed to generate idea:', error);
      setError('Could not generate a new idea. Please try again.');
    } finally {
      setIsGeneratingIdeaFor(null);
    }
  };


  // --- RENDER ---
  
  return (
    <>
      <header>
        <h1>Product Studio</h1>
        <p>AI-powered background generation for your products.</p>
        <div className="header-actions">
            <button className="header-button" onClick={() => setShowProjectsModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.06.44l7.126 7.126a1.5 1.5 0 0 1 0 2.121l-2.12 2.121a1.5 1.5 0 0 1-2.121 0l-7.126-7.126A1.5 1.5 0 0 1 2 4.648V3.5ZM8.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-3.149 7.851a1.5 1.5 0 0 1 2.121 0l2.121 2.121a1.5 1.5 0 0 1 0 2.121l-1.148 1.147A1.5 1.5 0 0 1 7.352 18H3.5A1.5 1.5 0 0 1 2 16.5v-3.852a1.5 1.5 0 0 1 .44-1.06l3.01-3.01Z"/></svg>
                Projects
            </button>
            <button className="header-button reset-button" onClick={handleResetApp} disabled={!activeProject}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.312 5.312a1 1 0 0 1 0 1.414L12.414 10l2.898 2.898a1 1 0 1 1-1.414 1.414L11 11.414l-2.898 2.898a1 1 0 1 1-1.414-1.414L9.586 10 6.688 7.102a1 1 0 0 1 1.414-1.414L11 8.586l2.898-2.898a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM2 10a8 8 0 1 1 16 0 8 8 0 0 1 -16 0Z" clipRule="evenodd" /></svg>
                Start Over
            </button>
            <button className="header-button" onClick={toggleTheme}>
            {theme === 'dark' ?
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 4.343a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06ZM6.404 13.596a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06l-1.06 1.06ZM17.25 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM13.596 6.404a.75.75 0 0 1 1.06-1.06l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06ZM4.343 15.657a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06Z"/></svg> :
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.455 2.164A8.969 8.969 0 0 1 10 2c4.969 0 9 4.03 9 9s-4.031 9-9 9a9 9 0 0 1-8.005-4.883.75.75 0 0 1 .966-.992A7.5 7.5 0 0 0 10 16.5a7.5 7.5 0 0 0 0-15c-1.82 0-3.513.674-4.858 1.815a.75.75 0 0 1-.966-.992Z" clipRule="evenodd" /></svg>
            }
            </button>
        </div>
      </header>

      <main>
        <>
            <div className="card">
                <StepIndicator step={1} title="Upload Product Images" active={currentStep >= 1}>
                    {productImages.length > 0 && (
                        <button className="add-more-button" onClick={() => fileInputRef.current?.click()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
                            Add More
                        </button>
                    )}
                </StepIndicator>
                {currentStep === 1 && (
                    <div
                        className="upload-area"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageUpload(e.target.files!)}
                            disabled={isUploading || productImages.length >= MAX_PRODUCT_IMAGES}
                        />
                        {isUploading ? (
                            <div className="loading">Uploading...</div>
                        ) : (
                            <p><span>Click to upload</span> or drag and drop. Up to {MAX_PRODUCT_IMAGES} images.</p>
                        )}
                    </div>
                )}
            </div>

            {productImages.length > 0 && (
                <div className="card">
                    <StepIndicator step={2} title="Process & Refine" active={currentStep >= 2}>
                        {productImages.some(img => !img.isProcessed) && (
                            <>
                                <button
                                    className="secondary-button"
                                    onClick={handleSkipProcessing}
                                    disabled={isRemovingBackground !== null}
                                >
                                    Skip to Style
                                </button>
                                <button
                                    className="generate-button"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                    onClick={() => productImages.forEach(img => !img.isProcessed && handleReprocessImage(img.id))}
                                    disabled={isRemovingBackground !== null}
                                >
                                    Process All
                                </button>
                            </>
                        )}
                    </StepIndicator>
                    {currentStep >= 2 && (
                        <div className="product-thumbnail-grid">
                            {productImages.map(image => (
                                <div key={image.id} className={`product-thumbnail ${image.isProcessed ? 'processed' : ''}`}>
                                    <img src={image.processedData ?? image.data} alt={image.originalName} />
                                    <button className="remove-thumbnail-button" onClick={(e) => {e.stopPropagation(); handleRemoveProductImage(image.id);}}>&times;</button>
                                    {(isRemovingBackground === image.id || !image.isProcessed) && (
                                        <div className="product-thumbnail-overlay">
                                            {isRemovingBackground === image.id ? (
                                                <>
                                                    <div className="spinner-ui" style={{ borderTopColor: 'white', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}></div>
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <div className="thumbnail-actions">
                                                    <button onClick={() => handleReprocessImage(image.id)}>Process</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {productImages.some(img => img.isProcessed) && (
                <div className="card">
                    <StepIndicator step={3} title="Choose Visual Style" active={currentStep >= 3} />
                    {currentStep >= 3 && !selectedStyle && (
                        <>
                            <p className="step-subtitle">Select a style to define the overall look and feel of your product images.</p>
                            <div className="style-grid">
                                {VISUAL_STYLES.map(style => (
                                    <div key={style.name} className="style-card" onClick={() => handleStyleSelect(style)}>
                                        <div className="style-card-header">
                                            <span className="style-icon" dangerouslySetInnerHTML={{ __html: style.icon }}></span>
                                            <h3 className="style-name">{style.name}</h3>
                                        </div>
                                        <p className="style-description">{style.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {selectedStyle && (
                        <div className="selected-summary">
                            <h3>{selectedStyle.name}</h3>
                            <p>{selectedStyle.description}</p>
                            <button className="change-button" onClick={() => performProjectUpdate(p => ({ ...p, selectedStyle: null }))}>Change Style</button>
                        </div>
                    )}
                </div>
            )}

            {selectedStyle && (
                <div className="card">
                    <StepIndicator step={4} title="Select Backgrounds" active={currentStep >= 4} />
                    {currentStep >= 4 && (
                        <>
                            <p className="step-subtitle">Choose from curated backgrounds or create your own to place your product in context.</p>
                            <div className="carousel-wrapper">
                                <button className="carousel-nav left" onClick={() => handleCarouselScroll('left')}>&lt;</button>
                                <div className="carousel-container" ref={carouselRef}>
                                    {Object.entries(CUSTOM_BACKGROUNDS).map(([category, backgrounds]) => (
                                        <div key={category} className="carousel-card">
                                            <div className="carousel-card-header">
                                                <h3>{category}</h3>
                                                <button
                                                  className="generate-idea-button"
                                                  onClick={() => handleGenerateIdea(category)}
                                                  disabled={!!isGeneratingIdeaFor}
                                                  title="Generate a new idea for this category"
                                                >
                                                {isGeneratingIdeaFor === category ? <div className="spinner-ui"></div> : 
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M9.25 2.75a.75.75 0 0 0-1.5 0V4h-1V2.75a.75.75 0 0 0-1.5 0V4H4a1 1 0 0 0-1 1v1.5h1.25a.75.75 0 0 0 0-1.5H3V5h1.25a.75.75 0 0 0 0-1.5H3V2.75A.75.75 0 0 0 1.5 2h-1a.75.75 0 0 0 0 1.5H2V4h-.25A.75.75 0 0 0 .5 5.25v1.5a.75.75 0 0 0 1.5 0V5.5h1v.25a.75.75 0 0 0 1.5 0V5.5h1v.25a.75.75 0 0 0 1.5 0V5a1 1 0 0 0-1-1h-.25V2.75ZM8 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2-3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="M12.5 10.25a.75.75 0 0 0-1.5 0V12h-1v-1.75a.75.75 0 0 0-1.5 0V12H8a1 1 0 0 0-1 1v1.5h1.25a.75.75 0 0 0 0-1.5H7V13h1.25a.75.75 0 0 0 0-1.5H7v-1.25a.75.75 0 0 0 1.5 0V9.5h1v.25a.75.75 0 0 0 1.5 0V9.5h1v.25a.75.75 0 0 0 1.5 0V9a1 1 0 0 0-1-1h-.25v1.25Z" /></svg>
                                                }
                                                </button>
                                            </div>
                                            <div className="background-options-list">
                                                {backgrounds.map(bg => (
                                                    <button key={bg.name} className={`background-button ${selectedBackgrounds.some(b => b.prompt === bg.prompt) ? 'selected' : ''}`} onClick={() => handleBackgroundSelect(bg)}>
                                                        {bg.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="carousel-nav right" onClick={() => handleCarouselScroll('right')}>&gt;</button>
                            </div>

                            <div className="custom-prompt-section">
                                <input
                                    type="text"
                                    className="prompt-input"
                                    placeholder="Or enter your own custom background prompt..."
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomBackground()}
                                />
                                <button className="add-button" onClick={handleAddCustomBackground} disabled={!customPrompt.trim()}>Add</button>
                            </div>
                        </>
                    )}
                </div>
            )}
            
            {selectedBackgrounds.length > 0 && (
                <div className="card">
                <StepIndicator step={5} title="Review & Generate" active={currentStep >= 5} />
                    {currentStep >= 5 && (
                        <>
                            <div className="review-list">
                                {selectedBackgrounds.map(bg => (
                                    <div key={bg.id} className="review-item-wrapper">
                                        <div className="review-item">
                                            <span className="review-item-name">{bg.name}</span>
                                            <div className="review-item-controls">
                                                <span>Images:</span>
                                                <button className="count-button" onClick={() => handleBackgroundCountChange(bg.id, -1)} disabled={bg.count <= 1}>-</button>
                                                <span>{bg.count}</span>
                                                <button className="count-button" onClick={() => handleBackgroundCountChange(bg.id, 1)} disabled={bg.count >= MAX_IMAGES}>+</button>
                                                <button className="customize-button" onClick={() => setExpandedReviewItem(expandedReviewItem === bg.id ? null : bg.id)}>Customize</button>
                                                <button className="remove-button" onClick={() => handleRemoveBackground(bg.id)}>&times;</button>
                                            </div>
                                        </div>
                                        {expandedReviewItem === bg.id && (
                                            <div className="directions-panel">
                                                {Object.entries(PHOTOGRAPHIC_DIRECTIONS).map(([category, directions]) => (
                                                    <div key={category} className="direction-category">
                                                        <h4>{category}</h4>
                                                        <div className="direction-options">
                                                            {directions.map(dir => (
                                                                <button
                                                                    key={dir.name}
                                                                    className={`direction-button ${bg.directions[category as DirectionCategory] === dir.prompt ? 'selected' : ''}`}
                                                                    onClick={() => handleUpdateDirections(bg.id, category as DirectionCategory, dir.prompt)}
                                                                >
                                                                    {dir.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="direction-category">
                                                  <h4>Negative Prompt</h4>
                                                  <p className="direction-description">Describe elements to avoid in the generation (e.g., "text, watermarks, people").</p>
                                                  <input
                                                    type="text"
                                                    className="negative-prompt-input"
                                                    value={bg.negativePrompt}
                                                    onChange={(e) => handleUpdateNegativePrompt(bg.id, e.target.value)}
                                                    placeholder="e.g., text, watermarks, people"
                                                  />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="generate-section">
                                <div className={`total-images-indicator ${totalImageCount > 100 ? 'limit-exceeded' : ''}`}>
                                    Total Images to Generate: {totalImageCount}
                                </div>
                                <button
                                    className="generate-button"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || totalImageCount === 0 || totalImageCount > 100}
                                >
                                    {isGenerating ? <div className="spinner"></div> : 'Generate'}
                                </button>
                                {totalImageCount > 100 && <p className="error" style={{padding: '0.5rem', marginTop: '0.5rem'}}>Please reduce the total number of images to 100 or less.</p>}
                            </div>
                        </>
                    )}
                </div>
            )}
            
            {error && <div className="error">{error}</div>}

            {generatedImages.length > 0 && (
                <section className="results-section card">
                    <div className="results-section-header">
                      <h2>Your Results</h2>
                      <button className="download-all-button" onClick={handleDownloadAll}>Download All (.zip)</button>
                    </div>
                    {Object.entries(
                        generatedImages.reduce((acc, img) => {
                            const sourceImg = productImages.find(p => p.id === img.sourceId);
                            const key = sourceImg?.originalName ?? 'General';
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(img);
                            return acc;
                        }, {} as Record<string, GeneratedImage[]>))
                        .map(([productName, images]) => (
                            <div key={productName} className="result-group">
                                <div className="result-group-header">
                                    <h3>{productName}</h3>
                                </div>
                                <div className="results-grid">
                                    {images.map(image => (
                                        <div key={image.id} className="result-image-container" onClick={() => !image.videoUrl && setFullPreviewImage(image)}>
                                            <img
                                                src={image.data}
                                                alt={image.prompt}
                                                className="result-image"
                                            />
                                            {image.videoUrl ? (
                                                <div className="play-icon-overlay" onClick={() => setFullPreviewImage(image)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="m9 17 8-5-8-5z"></path></svg>
                                                </div>
                                            ) : (
                                                <div className="result-image-overlay">
                                                    <button className="overlay-edit-button" onClick={(e) => { e.stopPropagation(); setEditingImage(image); }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="m11.43 2.232 7.336 7.336a1.25 1.25 0 0 1 0 1.768l-1.318 1.318a1.25 1.25 0 0 1-1.768 0L8.347 5.321a1.25 1.25 0 0 1 0-1.768l1.318-1.318a1.25 1.25 0 0 1 1.767 0Zm-2.318 8.11-7.057 7.057a1.25 1.25 0 0 1-.884.364H.75a.75.75 0 0 1-.75-.75v-2.34a1.25 1.25 0 0 1 .364-.884l7.057-7.057a1.25 1.25 0 0 1 1.768 0l1.318 1.318a1.25 1.25 0 0 1 0 1.768L9.112 10.34Z"/></svg>
                                                        Edit
                                                    </button>
                                                    <div className="overlay-actions-corner">
                                                        <div className="tooltip-wrapper">
                                                            <button className="overlay-icon-button" onClick={(e) => { e.stopPropagation(); handleUpscale(image.id); }} disabled={upscalingId === image.id}>
                                                                {upscalingId === image.id ? <div className="spinner-ui"></div> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>}
                                                            </button>
                                                            <span className="tooltip">Upscale</span>
                                                        </div>
                                                        <div className="tooltip-wrapper">
                                                            <button className="overlay-icon-button" onClick={(e) => { e.stopPropagation(); handleGenerateVariations(image.id); }} disabled={!!variationsLoadingId}>
                                                                {variationsLoadingId === image.id ? <div className="spinner-ui"></div> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662s.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.092-1.21.138 2.43.138-3.662Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}
                                                            </button>
                                                            <span className="tooltip">Variations</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                             {(isGeneratingFill || upscalingId === image.id || variationsLoadingId === image.id || image.isGeneratingVideo) && (
                                                <div className="processing-overlay">
                                                    <div className="spinner-ui"></div>
                                                    <span>{image.isGeneratingVideo ? "Animating..." : "Processing..."}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </section>
            )}
        </>
      </main>

      {/* --- MODALS --- */}

      {showProjectsModal && (
        <div className="projects-modal-overlay" onClick={() => setShowProjectsModal(false)}>
            <div className="projects-modal" onClick={e => e.stopPropagation()}>
                <div className="projects-modal-header">
                    <h2>Projects</h2>
                </div>
                <div className="create-project-form">
                    <input type="text" placeholder="New project name..." onKeyDown={(e) => { if (e.key === 'Enter') { handleCreateProject(e.currentTarget.value); e.currentTarget.value = ''; } }} />
                    <button onClick={(e) => { const input = e.currentTarget.previousElementSibling as HTMLInputElement; handleCreateProject(input.value); input.value = ''; }}>Create</button>
                </div>
                {projects.length > 0 ? (
                    <div className="projects-list">
                        {projects.map(p => (
                            <div key={p.id} className="project-item">
                                <div className="project-item-info">
                                    <span className="project-name">{p.name} {p.id === activeProjectId && '(Active)'}</span>
                                    <span className="project-date">Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="project-item-actions">
                                    <button className="load" onClick={() => handleLoadProject(p.id)}>Load</button>
                                    <button className="delete" onClick={() => handleDeleteProject(p.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="projects-empty-message">No projects yet. Start by creating one!</p>
                )}
                 <button className="full-preview-close" onClick={() => setShowProjectsModal(false)}>&times;</button>
            </div>
        </div>
      )}

      {fullPreviewImage && (
        <div className="full-preview-overlay" onClick={() => setFullPreviewImage(null)}>
            <div className="full-preview-modal" onClick={e => e.stopPropagation()}>
                <div className="full-preview-image-wrapper">
                  {fullPreviewImage.videoUrl ? (
                      <video src={`${fullPreviewImage.videoUrl}&key=${process.env.API_KEY}`} controls autoPlay loop />
                  ) : (
                      <img src={fullPreviewImage.data} alt={fullPreviewImage.prompt} />
                  )}
                </div>
                <div className="full-preview-actions">
                    <button onClick={() => handleDownloadImage(fullPreviewImage)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" /><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" /></svg>
                        Download
                    </button>
                    <button onClick={() => { setEditingImage(fullPreviewImage); setFullPreviewImage(null); }} disabled={!!fullPreviewImage.videoUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="m11.43 2.232 7.336 7.336a1.25 1.25 0 0 1 0 1.768l-1.318 1.318a1.25 1.25 0 0 1-1.768 0L8.347 5.321a1.25 1.25 0 0 1 0-1.768l1.318-1.318a1.25 1.25 0 0 1 1.767 0Zm-2.318 8.11-7.057 7.057a1.25 1.25 0 0 1-.884.364H.75a.75.75 0 0 1-.75-.75v-2.34a1.25 1.25 0 0 1 .364-.884l7.057-7.057a1.25 1.25 0 0 1 1.768 0l1.318 1.318a1.25 1.25 0 0 1 0 1.768L9.112 10.34Z"/></svg>
                        Edit
                    </button>
                    <button onClick={() => handleUpscale(fullPreviewImage.id)} disabled={upscalingId === fullPreviewImage.id || !!fullPreviewImage.videoUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.59L7.3 9.38a.75.75 0 0 0-1.1 1.04l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.04l-1.95 2.1V6.75Z" clipRule="evenodd" /></svg>
                        Upscale
                    </button>
                    <button onClick={() => handleGenerateVariations(fullPreviewImage.id)} disabled={!!variationsLoadingId || !!fullPreviewImage.videoUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25ZM3.5 4.25a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H4.25a.75.75 0 0 1-.75-.75V4.25Z" clipRule="evenodd" /></svg>
                        Variations
                    </button>
                    <button onClick={() => handleGenerateDetailedPromptForImage(fullPreviewImage, 'long')} disabled={!!fullPreviewImage.videoUrl}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 3.562a.75.75 0 0 0-1.5 0v1.438h-1.438a.75.75 0 0 0 0 1.5h1.438v1.438a.75.75 0 0 0 1.5 0V6.5h1.438a.75.75 0 0 0 0-1.5h-1.438V3.562ZM4.53 4.22a.75.75 0 0 0-1.06 0l-1.22 1.22a.75.75 0 0 0 0 1.06l4 4a.75.75 0 0 0 1.06 0l1.22-1.22a.75.75 0 0 0 0-1.06l-4-4ZM10 10.5a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Zm-5.28 2.53a.75.75 0 0 0-1.06 0l-1.22 1.22a.75.75 0 0 0 0 1.06l4 4a.75.75 0 0 0 1.06 0l1.22-1.22a.75.75 0 0 0 0-1.06l-4-4Z" /><path d="M10 14.5a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 10 14.5Z" /></svg>
                      Get Prompt
                    </button>
                    <button onClick={() => handleOpenAnimationModal(fullPreviewImage)} disabled={!!fullPreviewImage.videoUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h13.5A2.25 2.25 0 0 0 19 13.75v-7.5A2.25 2.25 0 0 0 16.75 4H3.25Z M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        Animate
                    </button>
                </div>
                <button className="full-preview-close" onClick={() => setFullPreviewImage(null)}>&times;</button>
            </div>
        </div>
    )}

    {editingImage && (
        <div className="edit-overlay" onClick={() => setEditingImage(null)}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>
                <div className="edit-preview">
                    {/* Content for edit preview */}
                </div>
                <div className="edit-sidebar">
                    {/* Content for edit sidebar */}
                </div>
            </div>
        </div>
    )}

    {showPromptGenerator && promptGeneratorImage && (
        <div className="edit-overlay" onClick={() => setShowPromptGenerator(false)}>
            <div className="prompt-generator-modal" onClick={e => e.stopPropagation()}>
                <h3>Generate Prompt</h3>
                <p>Create a descriptive prompt from your image to use in other creations.</p>
                <div className="prompt-generator-content">
                    <div className="prompt-generator-preview">
                        <img src={promptGeneratorImage.data} alt="Prompt inspiration" />
                    </div>
                    <div className="prompt-generator-controls">
                        <div className="prompt-type-tabs">
                           {/* Add tabs for different prompt types if needed */}
                        </div>
                        <div className="generated-prompt-wrapper">
                            <textarea
                                className="generated-prompt-output"
                                value={isGeneratingPrompt ? 'Generating...' : generatedPrompt}
                                readOnly
                                placeholder="Generated prompt will appear here..."
                            />
                            <button className="copy-prompt-button" onClick={() => navigator.clipboard.writeText(generatedPrompt)}>Copy</button>
                        </div>
                    </div>
                </div>
                <button className="full-preview-close" onClick={() => setShowPromptGenerator(false)}>&times;</button>
            </div>
        </div>
    )}

    {showAnimationModal && animatingImage && (
        <div className="edit-overlay" onClick={() => setShowAnimationModal(false)}>
            <div className="animation-modal" onClick={e => e.stopPropagation()}>
                <h3>Animate Image</h3>
                <p>Bring your static image to life with a short animation.</p>
                <div className="animation-content">
                    <div className="animation-preview">
                        <div className="animation-preview-frame" style={{ aspectRatio: animationAspectRatio.replace(':', ' / ') }}>
                            <img src={animatingImage.data} alt="Animation preview" />
                        </div>
                        <div className="aspect-ratio-selector">
                            {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                <button key={ratio} className={animationAspectRatio === ratio ? 'selected' : ''} onClick={() => setAnimationAspectRatio(ratio)}>
                                    {ratio}
                                </button>
                            ))}
                        </div>
                        <p className="animation-preview-note">Note: Generation can take several minutes.</p>
                    </div>
                    <div className="animation-controls">
                        <h4>Animation Prompt</h4>
                        <textarea
                            className="edit-sidebar-textarea"
                            value={animationPrompt}
                            onChange={(e) => setAnimationPrompt(e.target.value)}
                            placeholder="e.g., A gentle breeze, subtle camera pan to the right, falling snow..."
                        />
                        <div className="animation-modal-actions">
                            <button
                                className="edit-section-action"
                                onClick={handleAnimate}
                                disabled={isGeneratingAnimation}
                            >
                                {isGeneratingAnimation ? <div className="spinner-ui"></div> : 'Generate Animation'}
                            </button>
                        </div>
                    </div>
                </div>
                <button className="full-preview-close" onClick={() => setShowAnimationModal(false)}>&times;</button>
            </div>
        </div>
    )}

    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);