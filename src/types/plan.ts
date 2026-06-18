export interface Plan {
  id?: number;
  plan_name: string,
  plan_description: string,
  is_active: boolean,
  price: number,
  currency: string,
  visibility: number,
  highlight_limit: number
  user_type: PlanUserType,
}

export enum PlanUserType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}