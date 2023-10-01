import { FiltersEnum } from "./FiltersEnum";

export interface Filter {
  type: FiltersEnum;
  title: string;
  value: string
}
