
export interface IProdItem {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    price: number | null;
    selected: boolean;
}

export interface IBasket {
    items: HTMLElement[];
    total: number;
    list: HTMLElement[];
}

export interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export interface IAddressForm {
    payment: string;
    address: string;
}

export interface IContactsForm {
    email: string;
    phone: string;
}

export interface IModal {
    content: HTMLElement;
}


export interface IOrderForm extends IAddressForm, IContactsForm {
    items: string[];
    total: number;
}

export interface IOderResult {
    id: string;
    total: number;
}


export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

export type TSuccess = Pick<IOderResult, 'total'>;
