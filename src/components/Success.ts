import { TSuccess } from '../types';
import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';



interface ISuccessPurchase {
	onClick: (event: MouseEvent) => void; 
}

export class SuccessOrder extends Component<TSuccess> {
	protected _close: HTMLElement; 
	protected _successSum: HTMLElement; 

	constructor(container: HTMLElement, actions: ISuccessPurchase) {
		super(container);

		this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
		this._successSum = ensureElement<HTMLElement>('.order-success__description', this.container);
		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
		}
	}

	// Установка общей суммы заказа
	set total(value: number) {
		this.setText(this._successSum, 'Списано ' + value + ' синапсов');
	}
}