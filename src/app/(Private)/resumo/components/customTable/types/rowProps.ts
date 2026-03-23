export interface IRowProps<T> {
  sortable?: boolean;
  sortValue?: (row: T) => any;
  render?: (row: T) => React.ReactNode;
  filterValue?: (row: T) => string | number;
}
