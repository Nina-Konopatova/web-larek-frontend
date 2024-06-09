import { Api, ApiListResponse } from './base/api';
import { IProdItem, IOrderForm, IOderResult } from '../types/index';

interface IAPIapplication {
	getCards: () => Promise<IProdItem[]>;						
	getCardsId: (id: string) => Promise<IProdItem>;				
	getOrder: (order: IOrderForm) => Promise<IOderResult>;  
}

export class APIapplication extends Api implements IAPIapplication {
	readonly cdn: string;
	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	// Получение списка продуктов
	getCards(): Promise<IProdItem[]> {
		return this.get('/product').then((data: ApiListResponse<IProdItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	// Получение информации о продукте по его ID
	getCardsId(id:string): Promise<IProdItem>{
		return this.get(`/product/${id}`).then((item: IProdItem)=>({
			...item,
			image:this.cdn + item.image,
		}))
	}

	// Оформление заказа
	getOrder(order:IOrderForm):Promise<IOderResult >{
		return this.post('/order', order).then((data: IOderResult) => data);
	}
} 