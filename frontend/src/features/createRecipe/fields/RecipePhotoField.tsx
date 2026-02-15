import { useId, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

type RecipePhotoFieldProps = {
  photoPreview: string | null;
  onPhotoChange: (file: File | null, preview: string | null) => void;
  className?: string;
};

export function RecipePhotoField({ photoPreview, onPhotoChange, className }: Readonly<RecipePhotoFieldProps>) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onPhotoChange(file, reader.result as string);
      reader.readAsDataURL(file);
    } else {
      onPhotoChange(null, null);
    }
  }

  function handleRemove() {
    onPhotoChange(null, null);
    inputRef.current?.form?.reset();
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium">
        Photo
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <label
          htmlFor={inputId}
          className={cn(
            'flex aspect-video w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted',
            photoPreview && 'overflow-hidden p-0',
          )}
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
          {photoPreview ? (
            <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
          ) : (
            <>
              <Camera className="size-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cliquez pour ajouter une photo</span>
            </>
          )}
        </label>
        {photoPreview && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
            Supprimer la photo
          </Button>
        )}
      </div>
    </div>
  );
}
