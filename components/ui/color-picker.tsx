"use client"
import { Paintbrush } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  disabled?: boolean
}

const colorOptions = [
  // Greens
  { value: "bg-green-100", label: "Light Green", darkClass: "dark:bg-green-900/30" },
  { value: "bg-green-200", label: "Green", darkClass: "dark:bg-green-800/40" },
  { value: "bg-emerald-100", label: "Emerald", darkClass: "dark:bg-emerald-900/30" },

  // Blues
  { value: "bg-blue-100", label: "Light Blue", darkClass: "dark:bg-blue-900/30" },
  { value: "bg-blue-200", label: "Blue", darkClass: "dark:bg-blue-800/40" },
  { value: "bg-sky-100", label: "Sky Blue", darkClass: "dark:bg-sky-900/30" },
  { value: "bg-cyan-100", label: "Cyan", darkClass: "dark:bg-cyan-900/30" },

  // Reds
  { value: "bg-red-100", label: "Light Red", darkClass: "dark:bg-red-900/30" },
  { value: "bg-red-200", label: "Red", darkClass: "dark:bg-red-800/40" },
  { value: "bg-rose-100", label: "Rose", darkClass: "dark:bg-rose-900/30" },

  // Yellows/Oranges
  { value: "bg-yellow-100", label: "Light Yellow", darkClass: "dark:bg-yellow-900/30" },
  { value: "bg-yellow-200", label: "Yellow", darkClass: "dark:bg-yellow-800/40" },
  { value: "bg-amber-100", label: "Amber", darkClass: "dark:bg-amber-900/30" },
  { value: "bg-orange-100", label: "Orange", darkClass: "dark:bg-orange-900/30" },

  // Purples
  { value: "bg-purple-100", label: "Light Purple", darkClass: "dark:bg-purple-900/30" },
  { value: "bg-purple-200", label: "Purple", darkClass: "dark:bg-purple-800/40" },
  { value: "bg-violet-100", label: "Violet", darkClass: "dark:bg-violet-900/30" },
  { value: "bg-fuchsia-100", label: "Fuchsia", darkClass: "dark:bg-fuchsia-900/30" },

  // Neutrals
  { value: "bg-gray-100", label: "Light Gray", darkClass: "dark:bg-gray-800/40" },
  { value: "bg-gray-200", label: "Gray", darkClass: "dark:bg-gray-700/50" },
  { value: "bg-slate-100", label: "Slate", darkClass: "dark:bg-slate-800/40" },
  { value: "bg-zinc-100", label: "Zinc", darkClass: "dark:bg-zinc-800/40" },
  { value: "bg-stone-100", label: "Stone", darkClass: "dark:bg-stone-800/40" },
]

export function ColorPicker({ color, onChange, disabled = false }: ColorPickerProps) {
  const selectedColor = colorOptions.find((c) => c.value === color) || colorOptions[0]

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn("w-[120px] justify-between", selectedColor.value, selectedColor.darkClass)}
        >
          <span className="truncate">{selectedColor.label}</span>
          <Paintbrush className="h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((colorOption) => (
            <button
              key={colorOption.value}
              className={cn(
                "h-8 w-8 rounded-md border border-muted",
                colorOption.value,
                colorOption.darkClass,
                color === colorOption.value && "ring-2 ring-primary ring-offset-2",
              )}
              onClick={() => onChange(colorOption.value)}
              title={colorOption.label}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
