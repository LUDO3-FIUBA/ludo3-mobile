import { FiltersEnum } from "./FiltersEnum";

export interface Filter {
  type: FiltersEnum;
  id: string;
  title: string;
  value: string
}
