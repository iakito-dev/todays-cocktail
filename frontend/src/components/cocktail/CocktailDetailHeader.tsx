import { DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit, Hammer, Heart, Wine, X } from 'lucide-react';
import type { Cocktail } from '../../lib/types';
import {
  BASE_LABELS,
  STRENGTH_LABELS,
  TECHNIQUE_LABELS,
  strengthColors,
} from './cocktailUtils';

interface CocktailDetailHeaderProps {
  cocktail: Cocktail;
  noteText: string | null;
  primaryName?: string | null;
  secondaryName?: string | null;
  isFavorite?: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onEditClick: () => void;
  onToggleFavorite?: (cocktailId: number) => void;
}

export function CocktailDetailHeader({
  cocktail,
  noteText,
  primaryName,
  secondaryName,
  isFavorite,
  isAdmin,
  onClose,
  onEditClick,
  onToggleFavorite,
}: CocktailDetailHeaderProps) {
  return (
    <DialogHeader className="bg-white z-10 px-2 sm:px-5 md:px-8 py-3 sm:py-5 border-b border-gray-100 text-left">
      <div className="relative w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between pr-2 sm:pr-4 lg:pr-12">
          <div className="space-y-2.5 sm:space-y-3">
            {secondaryName && (
              <p className="pl-px text-sm uppercase tracking-[0.3em] text-gray-400 font-semibold">
                {secondaryName}
              </p>
            )}
            <DialogTitle className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-gray-900 leading-snug">
              {primaryName}
            </DialogTitle>
            {noteText && (
              <p className="text-sm sm:text-base lg:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                {noteText}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Badge
                className={`${
                  strengthColors[cocktail.strength as keyof typeof strengthColors] ?? ''
                } px-3.5 py-1 text-[13px] sm:text-sm rounded-full tracking-tight border`}
              >
                {STRENGTH_LABELS[cocktail.strength]}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 px-3.5 py-1 text-[13px] sm:text-sm rounded-full font-medium border-gray-200 bg-white shadow-sm"
              >
                <Wine className="w-3.5 h-3.5" />
                {BASE_LABELS[cocktail.base]}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 px-3.5 py-1 text-[13px] sm:text-sm rounded-full font-medium border-gray-200 bg-white shadow-sm"
              >
                <Hammer className="w-3.5 h-3.5" />
                {TECHNIQUE_LABELS[cocktail.technique]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="absolute top-1.5 sm:top-2 right-0 flex gap-1.5 sm:gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              onClick={onEditClick}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(cocktail.id)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full text-gray-400 hover:text-red-500"
            >
              <Heart
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full text-gray-500 hover:bg-gray-50"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>
    </DialogHeader>
  );
}
