import './scss/styles.scss';


import { APIapplication } from './components/APIapplication';         
import { EventEmitter } from './components/base/events';       
import { API_URL, CDN_URL } from './utils/constants';          
import { Card, CardCatalog, CardPreview } from './components/Card'; 
import { ensureElement, cloneTemplate } from './utils/utils'; 
import { Page } from './components/Page';                       
import { StatusApp } from './components/AppData';              
import { Modal } from './components/Modal';
import { Basket, CardForBasket } from './components/Basket';
import { AddressForm, ContactsForm } from './components/Form';
import { IAddressForm, IContactsForm } from './types';
import { SuccessOrder} from './components/Success';
import { ApiListResponse } from './components/base/api';




// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const addressFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');




// Модель данных приложения
const api = new APIapplication(CDN_URL, API_URL);   // Создание экземпляра класса APIapplication с передачей констант API и CDN
const events = new EventEmitter();              // Создание экземпляра класса EventEmitter
const appData = new StatusApp({}, events);      // Создание экземпляра класса StatusApp

// Представление View
const page = new Page(document.body, events);   												// Создание экземпляра класса Page и передача ему корневого элемента и экземпляра EventEmitter
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events)					// Создание экземпляра класса Modal и передача ему контейнера для модального окна и экземпляра EventEmitter
const basket = new Basket(cloneTemplate(basketTemplate), events);								// Создание экземпляра корзины
const addressForm = new AddressForm(cloneTemplate(addressFormTemplate), events);				// Создание экземпляра формы адреса
const contactsForm = new ContactsForm(cloneTemplate(contactsFormTemplate), events);   			// Создание экземпляра формы контактов
const success = new SuccessOrder(cloneTemplate(successTemplate), { onClick: () => modal.close() })	// Создание экземпляра формы успешного заказа



// Обработчик события изменения списка карточек
events.on('cards:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});

		return card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});


// Изенились элементы каталога. Открытие карточки
events.on('card:select', (item: Card) => {
	page.locked = true;
	const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
		onClick: () => events.emit('card:toBasket', item),
	});
	modal.render({
		content: card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			description: item.description,
			price: item.price,
			selected: item.selected
		}),
	});
});


// Добавление товара в корзину
events.on('card:toBasket', (item: Card) => {
	item.selected = true;
	appData.addBasket(item);
	page.counter = appData.sumCardsInBasket();
	modal.close();
})

// Открытие корзины
events.on('basket:open', () => {
	page.locked = true
	const basketItems = appData.basket.map((item, index) => {
		const card = new CardForBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('basket:delete', item)
		}
		);
		return card.render({
			title: item.title,
			price: item.price,
			index: index + 1,
		});
	});
	modal.render({
		content: basket.render({
			list: basketItems,
			total: appData.getTotal(),
		}),
	});
});

// Удалить товар из корзины
events.on('basket:delete', (item: Card) => {
	appData.removeBasket(item.id);
	item.selected = false;
	basket.total = appData.getTotal();
	page.counter = appData.sumCardsInBasket();
	basket.refreshIndices();
	if (!appData.basket.length) {
		basket.disableButton();
	}
})

// Открыть форму заказа (адрес)
events.on('order:open', () => {
	modal.render({
		content: addressForm.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Открыть форму заказа (контакты)
events.on('order:submit', () => {
	appData.order.total = appData.getTotal()
	appData.setItems();
	modal.render({
		content: contactsForm.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

// Обработчик события выбора способа оплаты
events.on('buttonPayments:select', (event: { button: HTMLButtonElement }) => {
	event.button.classList.add('button_alt-active');
	appData.setOrderField('payment', event.button.getAttribute('name'));
});

// Обработчик изменения полей формы адреса
events.on(
	/^order\..*:change/,
	(data: { field: keyof IAddressForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);


// Обработчик изменения ошибок формы адреса
events.on('addressFormErrors:change', (errors: Partial<IAddressForm>) => {
	const { address, payment } = errors;
	addressForm.valid = !address && !payment;
	addressForm.errors = Object.values({ address, payment }).filter((i) => !!i).join('; ');
});


// Обработчик изменения полей формы контактов
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

// Обработчик изменения ошибок формы контактов
events.on('contactsFormErrors:change', (errors: Partial<IContactsForm>) => {
	const { email, phone } = errors;
	contactsForm.valid = !phone && !email;
	contactsForm.errors = [phone, email].filter((i) => !!i).join('; ');
});

// Отправлена форма заказа. Покупка товаров
events.on('contacts:submit', () => {
	api.post('/order', appData.order)
		.then((res) => {
			events.emit('order:success', res);
			appData.clearBasket();
			appData.resetForm();
			addressForm.disableButtons();
			page.counter = 0;
			appData.resetSelected();
		})
		.catch((err) => {
			console.log(err)
		})
})

// Окно успешной покупки
events.on('order:success', (res: ApiListResponse<string>) => {
	modal.render({
		content: success.render({
			total: res.total
		})
	})
})

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});


// Разблокируем прокрутку страницы. Закрытие модального окна и сброс значений форм
events.on('modal:close', () => {
	page.locked = false;
	appData.resetForm();
});

// Получение  карточек с сервера и установка списка карточек в состояние приложения
api.getCards()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

