import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FilterIcon } from 'lucide-react'

type FilterOption = {
  id: string | number
  label: string
}

type FilterGroup = {
  id: string
  title: string
  options: FilterOption[]
}

type FilterMenuProps = {
  filterGroups: FilterGroup[]
  selectedFilters: Record<string, (string | number)[]>
  onFilterChange: (filterGroup: string, selectedOptions: string[]) => void
  onApplyFilters: () => void
}

const FilterMenu = ({
  filterGroups,
  selectedFilters,
  onFilterChange,
  onApplyFilters,
}: FilterMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleCheckboxChange = (
    groupId: string,
    optionId: string,
    checked: boolean,
  ) => {
    const currentSelected = selectedFilters[groupId] || []
    const newSelected = checked
      ? [...currentSelected, optionId]
      : currentSelected.filter(id => id !== optionId)

    onFilterChange(groupId, newSelected)
  }

  const handleApplyFilters = () => {
    onApplyFilters()
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FilterIcon size={16} />
          Filter Results
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {filterGroups.map(group => (
            <div key={group.id} className="space-y-2">
              <h3 className="font-semibold text-primary">{group.title}</h3>
              <div className="space-y-1">
                {group.options.map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${group.id}-${option.id}`}
                      checked={(selectedFilters[group.id] || []).includes(
                        option.id,
                      )}
                      onCheckedChange={checked =>
                        handleCheckboxChange(
                          group.id,
                          option.id,
                          checked === true,
                        )
                      }
                    />
                    <label
                      htmlFor={`${group.id}-${option.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default FilterMenu
