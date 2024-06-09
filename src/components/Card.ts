
import { IProdItem, TCardCategory } from '../types';
import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';

// Интерфейс для поведения карточки
export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

// Абстрактный класс карточки
export abstract class Card extends Component<IProdItem> {

	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _category?: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _colors = <Record<string, string>>{
		"дополнительное": "additional",
		"софт-скил": "soft",
		"кнопка": "button",
		"хард-скил": "hard",
		"другое": "other",
	}

	constructor(protected container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>(`.card__price`, container);
		this._category = ensureElement<HTMLElement>('.card__category', container);
	}

	// Установка идентификатора товара
	set id(value: string) {
		this.container.dataset.id = value;
	}

	// Установка заголовка товара
	set title(value: string) {
		this._title.textContent = value;
	}

	// Установка изображения товара
	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	// // Установка категории товара
	set category(value: TCardCategory) {
		this._category.textContent = value;
		this._category.className = `card__category card__category_${this._colors[value]}`
	}

	// Устанавливает условие выбрали товар или нет.
	set selected(value: boolean) {
		if (!this._button.disabled) {
			this._button.disabled = value;
		}
	}

	// Установка цены товара, статуса кнопки, текст кнопки
	set price(value: number | null) {
		this.setText(this._price, value ? `${value.toString()} синапсов` : 'Бесценно');
		if (value === null && this._button) {
			this._button.disabled = true;
			this.setText(this._button, 'Нельзя купить');
		}
	}

	// Установка описания товара
	set description(value: string) {
		this.setText(this._description, value);
	}
}

// ____________________________________________________________________

// Класс карточки для каталога товаров
export class CardCatalog extends Card {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);
		
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			}
			else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	// Установка изображения товара
	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}
}

// _____________________________________________________________________________________________________

// Класс карточки для модального окна
export class CardPreview extends Card {

	// protected _description: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);


		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._description = ensureElement<HTMLButtonElement>('.card__text', container);
		this._button = ensureElement<HTMLButtonElement>('.card__button', container);
		if (this._button) {
			this._button.addEventListener('click', actions.onClick);
		}
	}

}