'use client';

import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import InputField from '@/ui/InputField/InputField';
import Button from '@/ui/Button/Button';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import { CreateImage, CreateImagePlans, CreateAttached, VideoPreview } from '@/types/propiedad';
import { apiFetch } from '@/lib/apiFetch';

const iconTrash = '/icons/trash.svg';
const iconUpload = '/icons/upload.svg';
const iconChevronUp = '/icons/chevron-up.svg';

const accordionItems = [
  {
    id: 'videos',
    title: 'Videos',
    description: 'Agregá hasta 10 videos de la propiedad desde YouTube.',
  },
  { id: 'planos', title: 'Planos', description: 'Formato HEIC, JFIF, PNG, JPG, JPEG, WEBP, PDF, máximo 20 MB.' },
  { id: 'recorrido', title: 'Recorrido 360', description: 'Agregá un recorrido 360° para mostrar los detalles de la propiedad.' },
];

export interface EmprendimientoImagesRef {
  submit: () => Promise<void>;
  getFiles: () => { images: File[]; plans: File[] };
  resetFiles: () => void;
  setExistingImages: (images: CreateImage[], plans?: (CreateImagePlans | CreateAttached)[]) => void;
  appendFilesToFormData: (formData: FormData) => void;
}

interface EmprendimientoImagesProps {
  draftId?: number | undefined;
  onUploadStatusChange?: (status: { hasImages: boolean; hasPlans: boolean }) => void;
  units?: boolean;
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

const EmprendimientoImages = forwardRef<EmprendimientoImagesRef, EmprendimientoImagesProps>(
  ({ draftId, onUploadStatusChange, units }, ref) => {
    const [images, setImages] = useState<CreateImage[]>([]);
    const [plans, setPlans] = useState<CreateImagePlans[]>([]);
    const [videos, setVideos] = useState<string[]>([]);
    const [videosPreview, setVideosPreview] = useState<VideoPreview[] | undefined>([]);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
    const [current360Url, setCurrent360Url] = useState<string>('');
    const [multimedia360, setMultimedia360] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedPlans, setUploadedPlans] = useState<File[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [draggedType, setDraggedType] = useState<'image' | 'plan' | 'video' | '360' | null>(null);
    const [dragOverGrid, setDragOverGrid] = useState<'image' | 'plan' | 'video' | '360' | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [fileDropZone, setFileDropZone] = useState<'image' | 'plan' | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const imageGridInputRef = useRef<HTMLInputElement>(null);
    const plansInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      onUploadStatusChange?.({
        hasImages: images.length > 0 || uploadedImages.length > 0,
        hasPlans: plans.length > 0 || uploadedPlans.length > 0,
      });
    }, [images.length, uploadedImages.length, plans.length, uploadedPlans.length, onUploadStatusChange]);

    useEffect(() => {
      if (!draftId) return;

      apiFetch(`${API_BASE_URL}/properties/${draftId}/multimedia`)
        .then((data) => {
          const payload: any = data;

          if (payload?.images && Array.isArray(payload.images)) {
            setImages(payload.images);
          }

          if (payload?.attached && Array.isArray(payload.attached)) {
            setPlans(payload.attached);
          }

          if (payload?.videos && Array.isArray(payload.videos)) {
            const apiVideos = payload.videos.map(resolveVideoUrl).filter((url: string) => Boolean(url));
            setVideos(apiVideos);
            setVideosPreview(payload.videos.map(buildVideoPreview));
            if (apiVideos.length > 0) {
              setOpenAccordions(prev => prev.includes('videos') ? prev : [...prev, 'videos']);
            }
          }

          if (payload?.multimedia360 && Array.isArray(payload.multimedia360)) {
            const routes = payload.multimedia360
              .map((item: any) => (typeof item === 'string' ? item : (item?.url ?? '')))
              .filter((url: string) => Boolean(url));
            setMultimedia360(routes);
          }
        })
        .catch((error) => console.error('Error loading multimedia:', error));
    }, [draftId]);

    const validateFile = (file: File, type: 'image' | 'plan'): boolean => {
      if (file.size > 20 * 1024 * 1024) { alert('El archivo excede el tamaño máximo de 20MB'); return false; }
      const imageFormats = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png'];
      const planFormats = ['image/heic', 'image/jfif', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
      const allowed = type === 'image' ? imageFormats : planFormats;
      if (!allowed.includes(file.type)) {
        alert(`Formato no permitido. Solo se aceptan: ${type === 'image' ? 'JPG, JPEG, WEBP, PNG' : 'HEIC, JFIF, PNG, JPG, JPEG, WEBP, PDF'}`);
        return false;
      }
      return true;
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'plan') => {
      const files = event.target.files;
      if (!files) return;
      const valid: File[] = [];
      for (let i = 0; i < files.length; i++) if (validateFile(files[i], type)) valid.push(files[i]);
      if (type === 'image') setUploadedImages(prev => [...prev, ...valid]);
      else setUploadedPlans(prev => [...prev, ...valid]);
      event.target.value = '';
    };

    const removeUploadedFile = (index: number, type: 'image' | 'plan') => {
      if (type === 'image') setUploadedImages(prev => prev.filter((_, i) => i !== index));
      else setUploadedPlans(prev => prev.filter((_, i) => i !== index));
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

    const removePlan = (index: number, from: 'api' | 'local') => {
      if (from === 'api') setPlans(prev => prev.filter((_, i) => i !== index));
      else removeUploadedFile(index, 'plan');
    };

    const addVideo = () => {
      const trimmedUrl = currentVideoUrl.trim();
      if (!trimmedUrl || !isValidYouTubeUrl(trimmedUrl)) {
        alert('Por favor, ingresa una URL valida de YouTube');
        return;
      }

      if (videos.length >= 10) {
        alert('Maximo 10 videos permitidos');
        return;
      }

      const videoId = extractYouTubeId(trimmedUrl);
      if (!videoId) return;

      const newVideo: VideoPreview = {
        url: trimmedUrl,
        id: videoId,
        thumbnail: getYouTubeThumbnail(videoId),
      };

      setVideos(prev => [...prev, newVideo.url]);
      setVideosPreview(prev => [...(prev ?? []), newVideo]);
      setCurrentVideoUrl('');
    };

    const removeVideo = (index: number) => {
      setVideos(prev => prev.filter((_, i) => i !== index));
      setVideosPreview(prev => prev?.filter((_, i) => i !== index));
    };

    const handleDragStart = (e: React.DragEvent, index: number, type: 'image' | 'plan' | 'video' | '360') => {
      console.log('🚀 DRAG START - index:', index, 'type:', type);
      setDraggedIndex(index); setDraggedType(type); e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleItemDragOver = (e: React.DragEvent, index: number, type: 'image' | 'plan' | 'video' | '360') => {
      e.preventDefault();
      e.stopPropagation(); // Prevent grid from also handling this
      e.dataTransfer.dropEffect = 'move';
      console.log('🔄 ITEM DRAG OVER - index:', index, 'type:', type, 'draggedIndex:', draggedIndex);
      if (draggedType === type) setDragOverIndex(index);
    };
    const getShift = (itemIndex: number, type: 'image' | 'plan' | 'video' | '360'): string => {
      if (draggedIndex === null || dragOverIndex === null || draggedType !== type || itemIndex === draggedIndex) return '';
      if (draggedIndex < dragOverIndex) {
        if (itemIndex > draggedIndex && itemIndex <= dragOverIndex) return 'shift-left';
      } else if (draggedIndex > dragOverIndex) {
        if (itemIndex >= dragOverIndex && itemIndex < draggedIndex) return 'shift-right';
      }
      return '';
    };
    const handleGridDragOver = (e: React.DragEvent, type: 'image' | 'plan' | 'video' | '360') => {
      e.preventDefault();
      if (draggedType === type) { setDragOverGrid(type); e.dataTransfer.dropEffect = 'move'; }
    };
    const handleGridDragLeave = (e: React.DragEvent) => {
      const r = e.currentTarget.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom) setDragOverGrid(null);
    };
    const handleDrop = (e: React.DragEvent, dropIndex: number, type: 'image' | 'plan' | 'video' | '360') => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔵 DROP - draggedIndex:', draggedIndex, 'dropIndex:', dropIndex, 'type:', type);
      if (draggedIndex === null || draggedType !== type) return;
      if (type === 'image') {
        type IE = { kind: 'api'; data: CreateImage } | { kind: 'local'; data: File };
        const unified: IE[] = [
          ...images.map(d => ({ kind: 'api' as const, data: d })),
          ...uploadedImages.map(d => ({ kind: 'local' as const, data: d })),
        ];
        const item = unified[draggedIndex]; unified.splice(draggedIndex, 1); unified.splice(dropIndex, 0, item);
        setImages(unified.filter(e => e.kind === 'api').map(e => e.data as CreateImage));
        setUploadedImages(unified.filter(e => e.kind === 'local').map(e => e.data as File));
      } else if (type === 'plan') {
        const arr = [...uploadedPlans]; const item = arr[draggedIndex]; arr.splice(draggedIndex, 1); arr.splice(dropIndex, 0, item); setUploadedPlans(arr);
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
      } else if (type === '360') {
        const new360 = [...multimedia360];
        const dragged360 = new360[draggedIndex];
        new360.splice(draggedIndex, 1);
        new360.splice(dropIndex, 0, dragged360);
        setMultimedia360(new360);
      }
      setDraggedIndex(null); setDraggedType(null); setDragOverGrid(null); setDragOverIndex(null);
    };
    const handleDragEnd = () => {
      console.log('🏁 DRAG END - draggedIndex:', draggedIndex);
      setDraggedIndex(null); setDraggedType(null); setDragOverGrid(null); setDragOverIndex(null);
    };

    const addUrl = () => {
      const trimmedUrl = current360Url.trim();
      if (!trimmedUrl || multimedia360.length >= 10) return;
      setMultimedia360(prev => [...prev, trimmedUrl]);
      setCurrent360Url('');
    };
    const removeUrl = (index: number) => {
      setMultimedia360(prev => prev.filter((_, i) => i !== index));
    };

    const uploadMultimediaMutation = useMutation({
      mutationFn: async (formData: FormData) => {
        return apiFetch(`${API_BASE_URL}/properties/${draftId}/save-multimedia`, { method: 'POST', body: formData });
      },
    });

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const formData = new FormData();
        images.forEach(img => { if (img.url) formData.append('images', setImagePath(img.url)); });
        uploadedImages.forEach(file => formData.append('images', file));
        plans.forEach(plan => { if (plan.file_url) formData.append('attached', setImagePath(plan.file_url)); });
        uploadedPlans.forEach(file => formData.append('attached', file));
        formData.append('videos', JSON.stringify(videos));
        formData.append('multimedia360', JSON.stringify(multimedia360));
        const result = await uploadMultimediaMutation.mutateAsync(formData);
        const payload: any = result;
        if (payload?.images) setImages(payload.images);
        if (payload?.videos && Array.isArray(payload.videos)) {
          const apiVideos = payload.videos.map(resolveVideoUrl);
          setVideos(apiVideos);
          setVideosPreview(payload.videos.map(buildVideoPreview));
        }
      },
      getFiles: () => ({ images: uploadedImages, plans: uploadedPlans }),
      appendFilesToFormData: (formData: FormData) => {
        images.forEach(img => { if (img.url) formData.append('images', setImagePath(img.url)); });
        uploadedImages.forEach(file => formData.append('images', file));
        plans.forEach(plan => { if (plan.file_url) formData.append('attached', setImagePath(plan.file_url)); });
        uploadedPlans.forEach(file => formData.append('attached', file));
        formData.append('videos', JSON.stringify(videos));
        formData.append('multimedia360', JSON.stringify(multimedia360));
      },
      resetFiles: () => {
        setImages([]);
        setUploadedImages([]);
        setPlans([]);
        setUploadedPlans([]);
        setVideos([]);
        setVideosPreview([]);
        setCurrentVideoUrl('');
        setMultimedia360(['']);
      },
      setExistingImages: (existingImages: CreateImage[], existingPlans?: (CreateImagePlans | CreateAttached)[]) => {
        setImages(existingImages);
        setUploadedImages([]);
        if (existingPlans && existingPlans.length > 0) {
          setPlans(existingPlans as CreateImagePlans[]);
          setUploadedPlans([]);
          setOpenAccordions(prev => prev.includes('planos') ? prev : [...prev, 'planos']);
        }
      },
    }));

    return (
      <section className="section">
        <h2 className="section-title">Agregar imágenes {units ? 'de la unidad' : 'del emprendimiento'}</h2>

        {/* Fotos */}
        <div className="form-group">
          <div className="form-field full-width">
            <label className="field-label">Fotos</label>
            <span className="helper-text">Formato JPG, JPEG, WEBP, PNG, máximo 20 MB.</span>
            <input ref={imageInputRef} type="file" multiple accept=".jpg,.jpeg,.webp,.png" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'image')} />
            <input ref={imageGridInputRef} type="file" multiple accept=".jpg,.jpeg,.webp,.png" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'image')} />
            {images.length === 0 && uploadedImages.length === 0 ? (
              <button type="button" className={`publish-content-upload-card ${isDraggingFile && fileDropZone === 'image' ? 'file-drag-over' : ''}`} onClick={() => imageInputRef.current?.click()}
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
                  
                  console.log('🟢 GRID DROP (images) - hasFiles:', hasFiles, 'isInternalDrag:', isInternalDrag, 'draggedType:', draggedType);
                  
                  // Only handle file drops from explorer
                  if (hasFiles && !isInternalDrag) {
                    console.log('📁 Processing file drop');
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileDropFromExplorer(e, 'image');
                    setDragOverGrid(null);
                  } else if (isInternalDrag) {
                    console.log('⚠️ Internal drag at grid - not handling, items will handle');
                    // Don't do anything for internal drags - items handle it completely
                  }
                }}
              >
                <button type="button" className={`publish-content-upload-card ${isDraggingFile && fileDropZone === 'image' ? 'file-drag-over' : ''}`} onClick={() => imageGridInputRef.current?.click()}
                  onDragOver={(e) => handleDragOverFromExplorer(e, 'image')}
                  onDrop={(e) => handleFileDropFromExplorer(e, 'image')}
                  onDragLeave={() => { setIsDraggingFile(false); setFileDropZone(null); }}
                >
                  <img src={iconUpload} alt="" />
                  <span>Agregar fotos</span>
                </button>
                {images.map((image, index) => {
                  const isCompleted = image.upload_status === 'completed';
                  const isUp = image.upload_status === 'uploading' || image.upload_status === 'pending';
                  const hasError = image.upload_status === 'failed' || image.error_message;
                  return (
                    <div key={`${image.id || image.url}-${index}`}
                      className={`publish-content-thumb ${hasError ? 'has-error' : ''} ${draggedIndex === index && draggedType === 'image' ? 'dragging' : ''} ${getShift(index, 'image')}`}
                      draggable onDragStart={(e) => handleDragStart(e, index, 'image')} onDragOver={(e) => handleItemDragOver(e, index, 'image')} onDrop={(e) => handleDrop(e, index, 'image')} onDragEnd={handleDragEnd}
                    >
                      {index === 0 && <div className="publish-content-thumb-main-label">Foto principal</div>}
                      {isUp ? <div className="publish-content-upload-loading"><div className="spinner" /><span>Subiendo...</span></div>
                        : hasError ? <div className="publish-content-upload-error"><span className="error-icon">!</span><small>{image.error_message || 'Error'}</small></div>
                        : image.url ? <img src={setImagePath(image.url)} alt="Foto" />
                        : null}
                      <button type="button" className="publish-content-thumb-action" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}><img src={iconTrash} alt="" /></button>
                    </div>
                  );
                })}
                {uploadedImages.map((file, index) => {
                  const ui = images.length + index;
                  return (
                    <div key={`up-img-${index}`}
                      className={`publish-content-thumb ${draggedIndex === ui && draggedType === 'image' ? 'dragging' : ''} ${getShift(ui, 'image')}`}
                      draggable onDragStart={(e) => handleDragStart(e, ui, 'image')} onDragOver={(e) => handleItemDragOver(e, ui, 'image')} onDrop={(e) => handleDrop(e, ui, 'image')} onDragEnd={handleDragEnd}
                    >
                      {ui === 0 && <div className="publish-content-thumb-main-label">Foto principal</div>}
                      <img src={URL.createObjectURL(file)} alt="Foto" />
                      <button type="button" className="publish-content-thumb-action" onClick={() => removeUploadedFile(index, 'image')}><img src={iconTrash} alt="" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Planos + Recorrido 360 accordion */}
        <div className="form-group">
          <div className="publish-content-accordion">
            {accordionItems.map((item) => (
              <div key={item.id} className={`publish-content-accordion-item ${openAccordions.includes(item.id) ? 'is-open' : ''}`}>
                <button type="button" className="publish-content-accordion-header" onClick={() => setOpenAccordions(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}>
                  <span>{item.title}</span>
                  <div className="chevron-container"><img src={iconChevronUp} alt="" /></div>
                </button>
                {openAccordions.includes(item.id) && (
                  <div className="publish-content-accordion-body">
                    <p>{item.description}</p>
                    {item.id === 'planos' && (
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
                          
                          console.log('🟢 GRID DROP (plans) - hasFiles:', hasFiles, 'isInternalDrag:', isInternalDrag, 'draggedType:', draggedType);
                          
                          // Only handle file drops from explorer
                          if (hasFiles && !isInternalDrag) {
                            console.log('📁 Processing file drop');
                            e.preventDefault();
                            e.stopPropagation();
                            handleFileDropFromExplorer(e, 'plan');
                            setDragOverGrid(null);
                          } else if (isInternalDrag) {
                            console.log('⚠️ Internal drag at grid - not handling, items will handle');
                            // Don't do anything for internal drags - items handle it completely
                          }
                        }}
                      >
                        <input ref={plansInputRef} type="file" multiple accept=".heic,.jfif,.png,.jpg,.jpeg,.webp,.pdf" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'plan')} />
                        <button type="button" className={`publish-content-upload-card ${isDraggingFile && fileDropZone === 'plan' ? 'file-drag-over' : ''}`} onClick={() => plansInputRef.current?.click()}
                          onDragOver={(e) => handleDragOverFromExplorer(e, 'plan')}
                          onDrop={(e) => handleFileDropFromExplorer(e, 'plan')}
                          onDragLeave={() => { setIsDraggingFile(false); setFileDropZone(null); }}
                        >
                          <img src={iconUpload} alt="" />
                          <span>Agregar planos</span>
                        </button>
                        {plans.map((plan, index) => {
                          const isCompleted = plan.upload_status === 'completed';
                          const isUp = plan.upload_status === 'uploading' || plan.upload_status === 'pending';
                          const hasError = plan.upload_status === 'failed' || plan.error_message;
                          return (
                            <div key={`${plan.id || plan.file_url}-${index}`} className={`publish-content-thumb ${hasError ? 'has-error' : ''}`}>
                              {isUp ? <div className="publish-content-upload-loading"><div className="spinner" /><span>Subiendo...</span></div>
                                : hasError ? <div className="publish-content-upload-error"><span className="error-icon">!</span><small>{plan.error_message || 'Error'}</small></div>
                                : plan.file_url ? (plan.file_url.toLowerCase().endsWith('.pdf')
                                  ? <div className="publish-content-pdf-thumb"><span>PDF</span><small>{plan.file_url.split('/').pop()}</small></div>
                                  : <img src={setImagePath(plan.file_url)} alt="Plano" />)
                                : null}
                              <button type="button" className="publish-content-thumb-action" onClick={() => removePlan(index, 'api')}><img src={iconTrash} alt="" /></button>
                            </div>
                          );
                        })}
                        {uploadedPlans.map((file, index) => {
                          const pi = (plans.length) + index;
                          return (
                            <div key={`up-plan-${index}`}
                              className={`publish-content-thumb ${draggedIndex === pi && draggedType === 'plan' ? 'dragging' : ''} ${getShift(pi, 'plan')}`}
                              draggable onDragStart={(e) => handleDragStart(e, pi, 'plan')} onDragOver={(e) => handleItemDragOver(e, pi, 'plan')} onDrop={(e) => handleDrop(e, pi, 'plan')} onDragEnd={handleDragEnd}
                            >
                              {file.type === 'application/pdf'
                                ? <div className="publish-content-pdf-thumb"><span>PDF</span><small>{file.name}</small></div>
                                : <img src={URL.createObjectURL(file)} alt="Plan" />}
                              <button type="button" className="publish-content-thumb-action" onClick={() => removeUploadedFile(index, 'plan')}><img src={iconTrash} alt="" /></button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {item.id === 'videos' && (
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
                          <p className="publish-content-limit-message">Maximo 10 videos permitidos</p>
                        )}
                      </div>
                    )}
                    {item.id === 'recorrido' && (
                      <div className="publish-content-videos-container">
                        <div className="publish-content-input-row">
                          <InputField
                            placeholder="Copiá y pegá la URL del recorrido acá"
                            value={current360Url}
                            onChange={(e) => setCurrent360Url(e.target.value)}
                          />
                          <Button
                            label="Agregar"
                            variant="primary"
                            buttonType="1"
                            onClick={addUrl}
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
                                  onClick={() => removeUrl(index)}
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
                        {multimedia360.length >= 10 && <p className="publish-content-limit-message">Máximo 10 recorridos permitidos</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

EmprendimientoImages.displayName = 'EmprendimientoImages';

export default EmprendimientoImages;
