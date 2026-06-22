'use client';

import { useState, useEffect, useRef } from 'react';
import './PublishContent.scss';
import Button from '@/ui/Button/Button';
import InputField from '@/ui/InputField/InputField';
import { CreateImage, CreateImagePlans, CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS, VideoPreview } from '@/types/propiedad';

// Replace fetch with useMutation for multimedia upload
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';

const iconChevron = '/icons/chevron-up.svg';
const iconTrash = '/icons/trash.svg';
const iconUpload = '/icons/upload.svg';

const accordionItems = [
  {
    id: 'videos',
    title: 'Videos',
    description: 'Agregá hasta 10 videos de la propiedad desde YouTube.',
  },
  {
    id: 'planos',
    title: 'Planos',
    description: 'Formato HEIC, JFIF, PNG, JPG, JPEG, WEBP, PDF, máximo 20 MB.',
  },
  {
    id: 'recorrido',
    title: 'Recorrido 360',
    description: 'Agregá un recorrido 360° para mostrar los detalles de la propiedad.',
  },
];


  interface PublishContentProps {
    wizardData: CreatePropertyDraft;
    updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
    onNext: () => void;
    onBack: () => void;
    onSaveAndExit: () => void;
  }

  // YouTube utility functions
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null; 
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    return extractYouTubeId(url) !== null;
  };

  const resolveVideoUrl = (v: any): string => typeof v === 'string' ? v : (v?.url ?? '');
  const buildVideoPreview = (v: any): VideoPreview => {
    const url = resolveVideoUrl(v);
    const videoId = extractYouTubeId(url) ?? null;
    return { url, id: videoId, thumbnail: videoId ? getYouTubeThumbnail(videoId) : '' } as VideoPreview;
  };


export default function PublishContent({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit,
}: PublishContentProps) {
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [images, setImages] = useState<CreateImage[] | undefined>(wizardData.images || []);
  const [plans, setPlans] = useState<CreateImagePlans[] | undefined>(wizardData.plans || []);
  const [showTooltip, setShowTooltip] = useState(false);
  const [videos, setVideos] = useState<string[]>(
    wizardData.videos?.map(resolveVideoUrl) || []
  );
  const [videosPreview, setVideosPreview] = useState<VideoPreview[] | undefined>(
    wizardData.videos?.map(buildVideoPreview) || []
  );
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [current360Url, setCurrent360Url] = useState<string>('');
  const [multimedia360, setMultimedia360] = useState<string[]>(wizardData.multimedia360 || []);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedPlans, setUploadedPlans] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<'image' | 'plan' | 'video' | '360' | null>(null);
  const [dragOverGrid, setDragOverGrid] = useState<'image' | 'plan' | 'video' | '360' | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [fileDropZone, setFileDropZone] = useState<'image' | 'plan' | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageGridInputRef = useRef<HTMLInputElement>(null);
  const plansInputRef = useRef<HTMLInputElement>(null);

  // Update wizard data when content data changes
  useEffect(() => {
    updateWizardData({
      images,
      plans,
      videos, // Keep as string array for wizard data
      multimedia360
    });
  }, [images, plans, videos, multimedia360, updateWizardData]);

  useEffect(() => {
    // call  APIURL /PROPERTYID/getMultimedia to get already uploaded multimedia (images and plans) and set them in state
    if (wizardData.draft_id) {
      apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}/multimedia`)
        .then(data => {
          if ((data as any)?.images && Array.isArray((data as any).images)) {
            setImages((data as any).images);
          }
          if ((data as any)?.attached && Array.isArray((data as any).attached)) {
            setPlans((data as any).attached);
          }
          if ((data as any)?.videos && Array.isArray((data as any).videos) && (data as any).videos.length > 0) {
            setVideos((data as any).videos.map(resolveVideoUrl));
            setVideosPreview((data as any).videos.map(buildVideoPreview));
          }
        })
        .catch(error => console.error('Error loading multimedia:', error));
    }
  }, [wizardData.draft_id]) 

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((accordionId) => accordionId !== id);
      } else {
        return [...prev, id];
      }
    });
    setShowTooltip(true);
  };

  const handleBack = () => {
    onBack();
  };

  const handleContinue = async () => {
    if (uploadedImages.length > 0 || uploadedPlans.length > 0) {
      await handleFormSubmit();
    } else {
      onNext();
    }
  };

  const removePlan = (index: number, type: 'api' | 'local') => {
    if (type === 'api') {
      setPlans(prev => prev?.filter((_, i) => i !== index));
    } else {
      removeUploadedFile(index, 'plan');
    }
  };

  // Video management functions
  const addVideo = () => {
    const trimmedUrl = currentVideoUrl.trim();
    if (!trimmedUrl || !isValidYouTubeUrl(trimmedUrl)) {
      alert('Por favor, ingresa una URL válida de YouTube');
      return;
    }
    
    if (videos.length >= 10) {
      alert('Máximo 10 videos permitidos');
      return;
    }

    const videoId = extractYouTubeId(trimmedUrl);
    if (videoId) {
      const newVideo: VideoPreview = {
        url: trimmedUrl,
        id: videoId,
        thumbnail: getYouTubeThumbnail(videoId)
      };
      setVideos(prev => [...prev, newVideo.url]);
      setVideosPreview(prev => [...(prev ?? []), newVideo]);
      setCurrentVideoUrl(''); // Clear input field
    }
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideosPreview(prev => prev?.filter((_, i) => i !== index));
  };

  // Video y multimedia URL management functions
  const addUrl = (type: "multimedia360") => {
    const currentUrl = current360Url.trim();
    if (!currentUrl) return;
    
    if (type === "multimedia360" && multimedia360.length < 10) {
      setMultimedia360(prev => [...prev, currentUrl]);
      setCurrent360Url(''); // Clear input after adding
    }
  };

  const removeUrl = (index: number, type: "multimedia360") => {
    if (type === "multimedia360") {
      setMultimedia360(prev => prev.filter((_, i) => i !== index));
    }
  };

  // File handling functions
  const validateFile = (file: File, type: 'image' | 'plan'): boolean => {
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    
    if (file.size > maxSize) {
      alert('El archivo excede el tamaño máximo de 20MB');
      return false;
    }

    const imageFormats = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png'];
    const planFormats = ['image/heic', 'image/jfif', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    
    const allowedFormats = type === 'image' ? imageFormats : planFormats;
    
    if (!allowedFormats.includes(file.type)) {
      const formatText = type === 'image' ? 'JPG, JPEG, WEBP, PNG' : 'HEIC, JFIF, PNG, JPG, JPEG, WEBP, PDF';
      alert(`Formato no permitido. Solo se aceptan archivos: ${formatText}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'plan') => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (validateFile(files[i], type)) {
        validFiles.push(files[i]);
      }
    }

    if (type === 'image') {
      setUploadedImages(prev => [...prev, ...validFiles]);
    } else {
      setUploadedPlans(prev => [...prev, ...validFiles]);
    }

    // Reset input
    event.target.value = '';
  };

  const removeUploadedFile = (index: number, type: 'image' | 'plan') => {
    if (type === 'image') {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setUploadedPlans(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle drag and drop from file explorer
  const handleDragOverFromExplorer = (e: React.DragEvent, type: 'image' | 'plan') => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingFile(true);
    setFileDropZone(type);
  };

  const handleFileDropFromExplorer = (e: React.DragEvent, type: 'image' | 'plan') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    setFileDropZone(null);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (validateFile(files[i], type)) {
        validFiles.push(files[i]);
      }
    }

    if (validFiles.length > 0) {
      if (type === 'image') {
        setUploadedImages(prev => [...prev, ...validFiles]);
      } else {
        setUploadedPlans(prev => [...prev, ...validFiles]);
      }
    }
  };

  const uploadMultimediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}/save-multimedia`, { method: 'POST', body: formData });
    },
  });

  const handleFormSubmit = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      // Append existing (already uploaded) image URLs as strings — backend will skip these
      images?.forEach((img) => {
        if (img.url) {
          formData.append('images', setImagePath(img.url));
        }
      });
      // Append new image files
      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });
      // Append existing (already uploaded) plan URLs as strings — backend will skip these
      plans?.forEach((plan) => {
        if (plan.file_url) {
          formData.append('attached', setImagePath(plan.file_url));
        }
      });
      // Append new plan files
      uploadedPlans.forEach((file) => {
        formData.append('attached', file);
      });
      formData.append('videos', JSON.stringify(videos));
      formData.append('multimedia360', JSON.stringify(multimedia360));

      const result = await uploadMultimediaMutation.mutateAsync(formData);
      
      // Update wizard data with uploaded file URLs if returned from API
      if (result.images) {
        setImages(result.images);
      }
      if (result.multimedia360) {
        // Update multimedia360 with uploaded file URLs
        const urlsFromFiles = result.multimedia360.map((item: any) => item.url);
        setMultimedia360(prev => [urlsFromFiles[0], ...urlsFromFiles.slice(1)]);
      }
      onNext();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir los archivos. Por favor, intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const getShift = (itemIndex: number, type: 'image' | 'plan' | 'video' | '360'): string => {
    if (draggedIndex === null || dragOverIndex === null || draggedType !== type || itemIndex === draggedIndex) return '';
    if (draggedIndex < dragOverIndex) {
      return itemIndex > draggedIndex && itemIndex <= dragOverIndex ? 'shift-left' : '';
    } else if (draggedIndex > dragOverIndex) {
      return itemIndex < draggedIndex && itemIndex >= dragOverIndex ? 'shift-right' : '';
    }
    return '';
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, index: number, type: 'image' | 'plan' | 'video' | '360') => {
    setDraggedIndex(index);
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDragOver = (e: React.DragEvent, index: number, type: 'image' | 'plan' | 'video' | '360') => {
    e.preventDefault();
    e.stopPropagation(); // Prevent grid from also handling this
    e.dataTransfer.dropEffect = 'move';
    if (draggedType === type) {
      setDragOverIndex(index);
    }
  };

  const handleGridDragOver = (e: React.DragEvent, type: 'image' | 'plan' | 'video' | '360') => {
    e.preventDefault();
    if (draggedType === type) {
      setDragOverGrid(type);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleGridDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX >= rect.right || 
        e.clientY < rect.top || e.clientY >= rect.bottom) {
      setDragOverGrid(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, type: 'image' | 'plan' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedType !== type) {
      return;
    }
    
    if (draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDraggedType(null);
      setDragOverGrid(null);
      setDragOverIndex(null);
      return;
    }
    
    if (type === 'image') {
      // Unified list: API images first, then local files
      type ImageEntry = { kind: 'api'; data: CreateImage } | { kind: 'local'; data: File };
      const unified: ImageEntry[] = [
        ...(images ?? []).map(d => ({ kind: 'api' as const, data: d })),
        ...uploadedImages.map(d => ({ kind: 'local' as const, data: d })),
      ];
      const draggedItem = unified[draggedIndex];
      unified.splice(draggedIndex, 1);
      unified.splice(dropIndex, 0, draggedItem);
      setImages(unified.filter(e => e.kind === 'api').map(e => e.data as CreateImage));
      setUploadedImages(unified.filter(e => e.kind === 'local').map(e => e.data as File));
    } else if (type === 'plan') {
      const newPlans = [...uploadedPlans];
      const draggedPlan = newPlans[draggedIndex];
      newPlans.splice(draggedIndex, 1);
      newPlans.splice(dropIndex, 0, draggedPlan);
      setUploadedPlans(newPlans);
    } else if (type === 'video') {
      const newVideos = [...videos];
      const draggedVideo = newVideos[draggedIndex];
      newVideos.splice(draggedIndex, 1);
      newVideos.splice(dropIndex, 0, draggedVideo);
      setVideos(newVideos);

      const newPreviews = [...(videosPreview ?? [])];
      const draggedPreview = newPreviews[draggedIndex];
      newPreviews.splice(draggedIndex, 1);
      newPreviews.splice(dropIndex, 0, draggedPreview);
      setVideosPreview(newPreviews);
    }
    
    setDraggedIndex(null);
    setDraggedType(null);
    setDragOverGrid(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedType(null);
    setDragOverGrid(null);
    setDragOverIndex(null);
  };

  return (
    <div className="publish-content">
      <div className="publish-content-inner">
        <div className="publish-content-card">
          <div className="publish-content-top">
            <div className="publish-content-route">
             {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} {wizardData.property_subtype ? '- ' + PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
             <button className="publish-location-link" type="button" onClick={onSaveAndExit}>
              Guardar y salir
            </button>
          </div>

          <div className="publish-content-status">
            <span className="publish-content-segment is-filled" />
            <span className="publish-content-segment is-partial" />
            <span className="publish-content-segment" />
          </div>

          <div className="publish-content-section">
            <div className="publish-content-header">
              <h1>Cargá las fotos y videos de la propiedad</h1>
              <div className="publish-content-required">
                <span>Datos obligatorios(*)</span>
                <button
                  type="button"
                  className={`publish-content-idea ${showTooltip ? 'is-active' : ''}`}
                  onClick={() => setShowTooltip((prev) => !prev)}
                  aria-label="Ver recomendacion"
                >
                  ?
                </button>
              </div>
              {showTooltip ? (
                <div className="publish-content-tooltip">
                  <p>
                    Recomendación: subí fotos claras y horizontales. No incluyas
                    datos personales en las imágenes.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="publish-content-field">
              <div className="publish-content-field-title">
                <h2>Fotos*</h2>
                <p>Formato JPG, JPEG, WEBP, máximo 20 MB.</p>
              </div>

              <div className="publish-content-upload">
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.webp,.png"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                <input
                  ref={imageGridInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.webp,.png"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                {(images?.length === 0 && uploadedImages.length === 0) ? (
                  <button
                    type="button"
                    className={`publish-content-upload-card ${isDraggingFile && fileDropZone === 'image' ? 'file-drag-over' : ''}`}
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => handleDragOverFromExplorer(e, 'image')}
                    onDrop={(e) => handleFileDropFromExplorer(e, 'image')}
                    onDragLeave={() => { setIsDraggingFile(false); setFileDropZone(null); }}
                  >
                    <img src={iconUpload} alt="" />
                    <span>Agregar fotos</span>
                  </button>
                ) : (
                  <div 
                    className={`publish-content-upload-grid ${dragOverGrid === 'image' ? 'drag-over' : ''} ${isDraggingFile && fileDropZone === 'image' ? 'file-drag-over' : ''}`}
                    onDragOver={(e) => {
                      handleGridDragOver(e, 'image');
                      handleDragOverFromExplorer(e, 'image');
                    }}
                    onDragLeave={(e) => {
                      handleGridDragLeave(e);
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (e.clientX < rect.left || e.clientX >= rect.right || 
                          e.clientY < rect.top || e.clientY >= rect.bottom) {
                        setIsDraggingFile(false);
                        setFileDropZone(null);
                      }
                    }}
                    onDrop={(e) => {
                      const hasFiles = e.dataTransfer.files && e.dataTransfer.files.length > 0;
                      const isInternalDrag = draggedType !== null;
                      
                      // Only handle file drops from explorer
                      if (hasFiles && !isInternalDrag) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFileDropFromExplorer(e, 'image');
                        setDragOverGrid(null);
                      } else if (isInternalDrag) {
                      
                        // Don't do anything for internal drags - items handle it completely
                        // The items onDrop will fire and handle the reordering
                      }
                    }}
                  >
                    <button
                      type="button"
                      className={`publish-content-upload-card ${isDraggingFile && fileDropZone === 'image' ? 'file-drag-over' : ''}`}
                      onClick={() => imageGridInputRef.current?.click()}
                      onDragOver={(e) => handleDragOverFromExplorer(e, 'image')}
                      onDrop={(e) => handleFileDropFromExplorer(e, 'image')}
                      onDragLeave={() => { setIsDraggingFile(false); setFileDropZone(null); }}
                    >
                      <img src={iconUpload} alt="" />
                      <span>Agregar fotos</span>
                    </button>
                    {images?.map((image, index) => {
                      const isCompleted = image.upload_status === 'completed';
                      const isUploading = image.upload_status === 'uploading' || image.upload_status === 'pending';
                      const hasError = image.upload_status === 'failed' || image.error_message;
                      
                      return (
                        <div 
                          key={`${image.id || image.url}-${index}`} 
                          className={`publish-content-thumb ${hasError ? 'has-error' : ''} ${draggedIndex === index && draggedType === 'image' ? 'dragging' : ''} ${getShift(index, 'image')}`}
                          style={hasError ? { border: '2px solid #d32f2f' } : {}}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index, 'image')}
                          onDragOver={(e) => handleItemDragOver(e, index, 'image')}
                          onDrop={(e) => handleDrop(e, index, 'image')}
                          onDragEnd={handleDragEnd}
                        >
                          {index === 0 && <div className="publish-content-thumb-main-label">Foto principal</div>}
                          {isUploading ? (
                            <div className="publish-content-upload-loading">
                              <div className="spinner" />
                              <span>Subiendo...</span>
                            </div>
                          ) : isCompleted ? (
                            <img src={ setImagePath(image.url) } alt="Foto" />
                          ) : hasError ? (
                            <div className="publish-content-upload-error">
                              <span className="error-icon">!</span>
                              <small>{image.error_message || 'Error en la carga'}</small>
                            </div>
                          ) : null}
                          <button
                            type="button"
                            className="publish-content-thumb-action"
                            onClick={() => setImages(prev => prev?.filter((_, i) => i !== index))}
                          >
                            <img src={iconTrash} alt="" />
                          </button>
                          <div className="publish-content-drag-handle">
                            <span>⋮⋮</span>
                          </div>
                        </div>
                      );
                    })}
                    {uploadedImages.map((file, index) => {
                      const unifiedIndex = (images?.length ?? 0) + index;
                      return (
                        <div
                          key={`uploaded-${index}`}
                          className={`publish-content-thumb ${draggedIndex === unifiedIndex && draggedType === 'image' ? 'dragging' : ''} ${getShift(unifiedIndex, 'image')}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, unifiedIndex, 'image')}
                          onDragOver={(e) => handleItemDragOver(e, unifiedIndex, 'image')}
                          onDrop={(e) => handleDrop(e, unifiedIndex, 'image')}
                          onDragEnd={handleDragEnd}
                        >
                          {unifiedIndex === 0 && <div className="publish-content-thumb-main-label"><img src="/icons/star.svg" alt="Star" />Foto principal</div>}
                          <img src={URL.createObjectURL(file)} alt="Foto" />
                          <button
                            type="button"
                            className="publish-content-thumb-action"
                            onClick={() => removeUploadedFile(index, 'image')}
                          >
                            <img src={iconTrash} alt="" />
                          </button>
                          <div className="publish-content-drag-handle">
                            <span>⋮⋮</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="publish-content-field">
              <div className="publish-content-field-title">
                <h2>Agregá más contenido</h2>
              </div>
              <div className="publish-content-accordion">
                {accordionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`publish-content-accordion-item ${
                      openAccordions.includes(item.id) ? 'is-open' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="publish-content-accordion-header"
                      onClick={() => toggleAccordion(item.id)}
                    >
                      <span>{item.title}</span>
                      <div className="chevron-container"><img src={iconChevron} alt="" /></div>
                    </button>
                    {openAccordions.includes(item.id) ? (
                      <div className="publish-content-accordion-body">
                        <p>{item.description}</p>
                        {item.id === 'videos' ? (
                          <div className="publish-content-videos-container">
                            <div className="publish-content-input-row">
                              <InputField                              
                                placeholder="Pegá el link de YouTube"
                                value={currentVideoUrl}
                                onChange={(event) => setCurrentVideoUrl(event.target.value)}
                              />
                              <Button
                                label="Agregar"
                                variant="primary"
                                buttonType="1"
                                onClick={addVideo}
                                disabled={!currentVideoUrl.trim() || videos.length >= 10}
                              />
                            </div>
                            {videos.length > 0 && (
                              <div 
                                className={`publish-content-videos-grid ${dragOverGrid === 'video' ? 'drag-over' : ''}`}
                                onDragOver={(e) => handleGridDragOver(e, 'video')}
                                onDragLeave={handleGridDragLeave}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setDragOverGrid(null);
                                }}
                              >
                                {videosPreview?.map((video, index) => (
                                  <div
                                    key={`video-${index}`}
                                    className={`publish-content-video-thumb ${draggedIndex === index && draggedType === 'video' ? 'dragging' : ''} ${getShift(index, 'video')}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index, 'video')}
                                    onDragOver={(e) => handleItemDragOver(e, index, 'video')}
                                    onDrop={(e) => handleDrop(e, index, 'video')}
                                    onDragEnd={handleDragEnd}
                                  >
                                    <img src={video.thumbnail} alt="Video thumbnail" />
                                    <div className="publish-content-video-overlay">
                                      <div className="publish-content-video-play">▶</div>
                                    </div>
                                    <button
                                      type="button"
                                      className="publish-content-thumb-action"
                                      onClick={() => removeVideo(index)}
                                    >
                                      <img src={iconTrash} alt="" />
                                    </button>
                                    <div className="publish-content-drag-handle">
                                      <span>⋮⋮</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {videos.length >= 10 && (
                              <p className="publish-content-limit-message">Máximo 10 videos permitidos</p>
                            )}
                          </div>
                        ) : null}
                        {item.id === 'recorrido' ? (
                          <div className="publish-content-videos-container">
                            <div className="publish-content-input-row">
                              <InputField                              
                                placeholder="Copiá y pegá la URL del recorrido acá"
                                value={current360Url}
                                onChange={(event) => setCurrent360Url(event.target.value)}
                              />
                              <Button
                                label="Agregar"
                                variant="primary"
                                buttonType="1"
                                onClick={() => addUrl("multimedia360")}
                                disabled={!current360Url.trim() || multimedia360.length >= 10}
                              />
                            </div>
                            {multimedia360.length > 0 && (
                              <div 
                                className={`publish-content-upload-grid compact ${dragOverGrid === '360' ? 'drag-over' : ''}`}
                                onDragOver={(e) => handleGridDragOver(e, '360')}
                                onDragLeave={handleGridDragLeave}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setDragOverGrid(null);
                                }}
                              >
                                {multimedia360.map((url, index) => (
                                  <div
                                    key={`360-${index}`}
                                    className={`publish-content-thumb ${draggedIndex === index && draggedType === '360' ? 'dragging' : ''} ${getShift(index, '360')}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index, '360')}
                                    onDragOver={(e) => handleItemDragOver(e, index, '360')}
                                    onDrop={(e) => handleDrop(e, index, '360')}
                                    onDragEnd={handleDragEnd}
                                  >
                                    <div className="publish-content-pdf-thumb">
                                      <span>360°</span>
                                      <small>{url.length > 30 ? `${url.substring(0, 30)}...` : url}</small>
                                    </div>
                                    <button
                                      type="button"
                                      className="publish-content-thumb-action"
                                      onClick={() => removeUrl(index, "multimedia360")}
                                    >
                                      <img src={iconTrash} alt="" />
                                    </button>
                                    <div className="publish-content-drag-handle">
                                      <span>⋮⋮</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {multimedia360.length >= 10 && (
                              <p className="publish-content-limit-message">Máximo 10 recorridos permitidos</p>
                            )}
                          </div>
                        ) : null}
                        {item.id !== 'videos' && item.id !== 'recorrido' ? (
                          <div 
                            className={`publish-content-upload-grid compact ${dragOverGrid === 'plan' ? 'drag-over' : ''} ${isDraggingFile && fileDropZone === 'plan' ? 'file-drag-over' : ''}`}
                            onDragOver={(e) => {
                              handleGridDragOver(e, 'plan');
                              handleDragOverFromExplorer(e, 'plan');
                            }}
                            onDragLeave={(e) => {
                              handleGridDragLeave(e);
                              const rect = e.currentTarget.getBoundingClientRect();
                              if (e.clientX < rect.left || e.clientX >= rect.right || 
                                  e.clientY < rect.top || e.clientY >= rect.bottom) {
                                setIsDraggingFile(false);
                                setFileDropZone(null);
                              }
                            }}
                            onDrop={(e) => {
                              const hasFiles = e.dataTransfer.files && e.dataTransfer.files.length > 0;
                              const isInternalDrag = draggedType !== null;
                              
                              // Only handle and prevent default for file drops from explorer
                              if (hasFiles && !isInternalDrag) {
                                e.preventDefault();
                                handleFileDropFromExplorer(e, 'plan');
                              }
                              // Don't preventDefault for internal drags - let items handle it
                              setDragOverGrid(null);
                            }}
                          >
                            <input
                              ref={plansInputRef}
                              type="file"
                              multiple
                              accept=".heic,.jfif,.png,.jpg,.jpeg,.webp,.pdf"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileSelect(e, 'plan')}
                            />
                            <button
                              type="button"
                              className={`publish-content-upload-card ${isDraggingFile && fileDropZone === 'plan' ? 'file-drag-over' : ''}`}
                              onClick={() => plansInputRef.current?.click()}
                              onDragOver={(e) => handleDragOverFromExplorer(e, 'plan')}
                              onDrop={(e) => handleFileDropFromExplorer(e, 'plan')}
                              onDragLeave={() => { setIsDraggingFile(false); setFileDropZone(null); }}
                            >
                              <img src={iconUpload} alt="" />
                              <span>Agregar planos</span>
                            </button>
                            {plans?.map((plan, index) => {
                              const isCompleted = plan.upload_status === 'completed';
                              const isUploading = plan.upload_status === 'uploading' || plan.upload_status === 'pending';
                              const hasError = plan.upload_status === 'failed' || plan.error_message;
                              
                              return (
                                <div 
                                  key={`${plan.id || plan.file_url}-${index}`} 
                                  className={`publish-content-thumb ${hasError ? 'has-error' : ''}`}
                                  style={hasError ? { border: '2px solid #d32f2f' } : {}}
                                >
                                  {isUploading ? (
                                    <div className="publish-content-upload-loading">
                                      <div className="spinner" />
                                      <span>Subiendo...</span>
                                    </div>
                                  ) : isCompleted ? (
                                    plan.file_url.toLowerCase().endsWith('.pdf') ? (
                                      <div className="publish-content-pdf-thumb">
                                        <span>PDF</span>
                                        <small>{plan.file_url.split('/').pop()}</small>
                                      </div>
                                    ) : (
                                      <img src={plan.file_url} alt="Plano" />
                                    )
                                  ) : hasError ? (
                                    <div className="publish-content-upload-error">
                                      <span className="error-icon">!</span>
                                      <small>{plan.error_message || 'Error en la carga'}</small>
                                    </div>
                                  ) : null}
                                  <button type="button" className="publish-content-thumb-action" onClick={() => removePlan(index, 'api')}>
                                    <img src={iconTrash} alt="" />
                                  </button>
                                </div>
                              );
                            })}
                            {uploadedPlans.map((file, index) => (
                              <div
                                key={`plan-local-${index}`}
                                className={`publish-content-thumb ${draggedIndex === (plans?.length ?? 0) + index && draggedType === 'plan' ? 'dragging' : ''} ${getShift((plans?.length ?? 0) + index, 'plan')}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, (plans?.length ?? 0) + index, 'plan')}
                                onDragOver={(e) => handleItemDragOver(e, (plans?.length ?? 0) + index, 'plan')}
                                onDrop={(e) => handleDrop(e, (plans?.length ?? 0) + index, 'plan')}
                                onDragEnd={handleDragEnd}
                              >
                                {file.type === 'application/pdf' ? (
                                  <div className="publish-content-pdf-thumb">
                                    <span>PDF</span>
                                    <small>{file.name}</small>
                                  </div>
                                ) : (
                                  <img src={URL.createObjectURL(file)} alt="Plan" />
                                )}
                                <button
                                  type="button"
                                  className="publish-content-thumb-action"
                                  onClick={() => removeUploadedFile((plans?.length ?? 0) + index, 'plan')}
                                >
                                  <img src={iconTrash} alt="" />
                                </button>
                                <div className="publish-content-drag-handle">
                                  <span>⋮⋮</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="publish-content-footer">
            <Button
              label="Volver"
              variant="back"
              onClick={handleBack}
              icon={<img src={iconChevron} alt="" />}
              iconPosition="left"
              className="publish-content-back"
            />
            <Button
              label={isUploading ? "Subiendo..." : "Continuar"}
              variant="primary"
              onClick={handleContinue}
              disabled={isUploading || ((images?.length ?? 0) + uploadedImages.length) === 0}
              className="publish-content-continue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
