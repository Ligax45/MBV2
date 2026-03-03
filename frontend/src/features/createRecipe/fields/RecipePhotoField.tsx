import { useId, useRef } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

type RecipePhotoFieldProps = {
  photoPreview: string | null;
  onPhotoChange: (file: File | null, preview: string | null) => void;
  className?: string;
};

export const RecipePhotoField = ({ photoPreview, onPhotoChange, className }: Readonly<RecipePhotoFieldProps>) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onPhotoChange(file, reader.result as string);
      reader.readAsDataURL(file);
    } else {
      onPhotoChange(null, null);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPhotoChange(null, null);
    inputRef.current?.form?.reset();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium">
        Photo
      </label>
      <div className="flex justify-center">
        {photoPreview ? (
          <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
            <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 size-9 rounded-full shadow-md"
              onClick={handleRemove}
              aria-label="Supprimer la photo"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="flex aspect-video w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
          >
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Photo"
            />
            <Camera className="size-10 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cliquez pour ajouter une photo</span>
          </label>
        )}
      </div>
    </div>
  );
};
