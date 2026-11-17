import { FilterForm } from '@/screens/EventsScreen/components/FilterForm';
import { useEventFilters } from '@/store/EventFiltersContext';

export function InlineFilters() {
  const filters = useEventFilters();
  return (
    <FilterForm
      compact
      value={filters.filters}
      options={filters.options}
      today={filters.today}
      onChange={(patch) => filters.applyFilters({ ...filters.filters, ...patch })}
    />
  );
}
