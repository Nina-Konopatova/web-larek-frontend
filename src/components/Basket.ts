import { IBasket, IProdItem } from "../types";
import { ensureElement } from "../utils/utils";
import { ICardActions } from "./Card";
import { Component } from "./base/Component";
import { EventEmitter } from "./base/events";

export class Basket extends Component<IBasket> {

    protected _item: HTMLElement;            
    protected _total: HTMLElement;          
    protected _button: HTMLButtonElement;   

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._item = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);

        // Если кнопка заказа существует, добавляем обработчик события на нажатие
        if (this._button) {
            this._button.addEventListener('click', () => events.emit('order:open'));

        }
    }

    // Установка общей суммы
    set total(price: number) {
        this.setText(this._total, price + 'Синапсов')
    }

    // Установка списка товаров в корзине и блокировка кнопки оформить при отсуттвии товаров в корзине
    set list(items: HTMLElement[]) {
        this._item.replaceChildren(...items);
        this._button.disabled = items.length ? false : true;
    }


    // Метод отключающий кнопку "Оформить"
    disableButton() {
        this._button.disabled = true
    }

    // Метод для обновления индексов таблички при удалении товара из корзины
    refreshIndices() {
        Array.from(this._item.children).forEach(
            (item, index) =>
            (item.querySelector(`.basket__item-index`)!.textContent = (
                index + 1
            ).toString())
        );
    }
}


// Класс карточки для корзины 


export interface ICardBasket extends IProdItem {
    index: number;
}


export class CardForBasket extends Component<ICardBasket> {

    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._index = ensureElement<HTMLImageElement>(`.basket__item-index`, container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._button = ensureElement<HTMLButtonElement>(`.card__button`, container);

        if (this._button) {
            this._button.addEventListener('click', (evt) => {
                this.container.remove(); actions?.onClick(evt);
            });
        }
    }
    // Установка заголовка товара
    set title(value: string) {
        this._title.textContent = value;
    }

    // Установка индекса товара
    set index(value: number) {
        this._index.textContent = value.toString();
    }

    // Установка общей суммы
    set price(price: number) {
        this.setText(this._price, price + 'Синапсов')
    }
}