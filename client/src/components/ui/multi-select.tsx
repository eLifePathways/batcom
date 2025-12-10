import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Command, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type MultiSelectProps<T> = {
  items: T[]
  selected: (string | number)[]
  onChange: (values: (string | number)[]) => void
  valueField: keyof T
  labelField: keyof T
  placeholder?: string
  title?: string
  className?: string
}

export function MultiSelect<T>({
  items,
  selected,
  onChange,
  valueField,
  labelField,
  placeholder = 'Select...',
  title,
  className,
}: MultiSelectProps<T>) {
  const toggle = (value: any) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value],
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {title && <label className="text-sm font-medium">{title}</label>}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[240px]">
          <Command>
            <CommandList>
              {items.map(item => {
                const value = item[valueField] as any
                const label = item[labelField] as any
                const isSelected = selected.includes(value)

                return (
                  <CommandItem
                    key={value}
                    onSelect={() => toggle(value)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {label}
                  </CommandItem>
                )
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
