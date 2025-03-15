import initialCards from "./cards.js";
// import { someFunction, anotherFunction } from './cards.js';
// import { initialCards } from './cards.js';


// DOM узлы
const placesList = document.querySelector(".places__list");
const cardTemplate = document.querySelector("#card-template").content;

// Попапы
const editPopup = document.querySelector(".popup_type_edit");
const newCardPopup = document.querySelector(".popup_type_new-card");

// Кнопки
const editButton = document.querySelector(".profile__edit-button");
const addButton = document.querySelector(".profile__add-button");
const closeButtons = document.querySelectorAll(".popup__close");

// Формы
const editForm = editPopup.querySelector(".popup__form");
const nameInput = editPopup.querySelector(".popup__input_type_name");
const jobInput = editPopup.querySelector(".popup__input_type_description");

const newCardForm = newCardPopup.querySelector(".popup__form");
const placeInput = newCardForm.querySelector(".popup__input_type_card-name");
const linkInput = newCardForm.querySelector(".popup__input_type_url");

// Данные профиля
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");

// Функция сохранения данных профиля в localStorage
function saveProfileData() {
  localStorage.setItem("profile", JSON.stringify({
    name: profileTitle.textContent,
    description: profileDescription.textContent,
  }));
}

// Функция загрузки данных профиля из localStorage
function loadProfileData() {
  const savedProfile = localStorage.getItem("profile");
  if (savedProfile) {
    const { name, description } = JSON.parse(savedProfile);
    profileTitle.textContent = name;
    profileDescription.textContent = description;
  }
}

// Функция сохранения карточек в localStorage
function saveCards(cards) {
  localStorage.setItem("cards", JSON.stringify(cards));
}

// Функция загрузки карточек из localStorage
function loadCards() {
  const savedCards = localStorage.getItem("cards");
  return savedCards ? JSON.parse(savedCards) : [...initialCards];
}

// Функция открытия попапа
function openPopup(popup) {
  popup.classList.add("popup_is-opened");
  document.addEventListener("keydown", closePopupOnEsc);
}

// Функция закрытия попапа
function closePopup(popup) {
  popup.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", closePopupOnEsc);
}

// Закрытие попапов по кнопке Esc
function closePopupOnEsc(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) {
      closePopup(openedPopup);
    }
  }
}

// Закрытие попапа по клику на оверлей
const popups = document.querySelectorAll(".popup");
popups.forEach((popup) => {
  popup.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("popup")) {
      closePopup(popup);
    }
  });
});

// Обработчики закрытия попапов
closeButtons.forEach((button) => {
  const popup = button.closest(".popup");
  button.addEventListener("click", () => closePopup(popup));
});

// Обработчик редактирования профиля
editButton.addEventListener("click", () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
  openPopup(editPopup);
});

editForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  profileTitle.textContent = nameInput.value;
  profileDescription.textContent = jobInput.value;
  saveProfileData(); // Сохранение данных в localStorage
  closePopup(editPopup);
});

// Функция создания карточки
function createCard(data) {
  const cardElement = cardTemplate.cloneNode(true).querySelector(".card");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const likeButton = cardElement.querySelector(".card__like-button");

  cardTitle.textContent = data.name;
  cardImage.src = data.link;
  cardImage.alt = data.name;

  // Обработчик удаления
  deleteButton.addEventListener("click", () => {
    cardElement.remove();
    let cards = loadCards();
    cards = cards.filter((card) => card.link !== data.link);
    saveCards(cards);
  });

  // Обработчик лайка
  likeButton.addEventListener("click", () => {
    likeButton.classList.toggle("card__like-button_active");
  });

  return cardElement;
}

// Функция рендера карточек
function renderCards() {
  placesList.innerHTML = "";
  const cards = loadCards();
  cards.forEach((cardData) => {
    const cardElement = createCard(cardData);
    placesList.append(cardElement);
  });
}

renderCards();

// Открытие попапа добавления карточки
addButton.addEventListener("click", () => {
  newCardForm.reset();
  openPopup(newCardPopup);
});

// Обработчик добавления новой карточки
newCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const newCard = {
    name: placeInput.value,
    link: linkInput.value,
  };

  // Загружаем текущие карточки, добавляем новую и сохраняем
  const updatedCards = [newCard, ...loadCards()];
  saveCards(updatedCards);

  const cardElement = createCard(newCard);
  placesList.prepend(cardElement);
  closePopup(newCardPopup);
});

// Функции валидации
function showInputError(form, input, errorMessage) {
  const errorElement = form.querySelector(`#${input.name}-error`);
  input.classList.add("popup__input_type_error");
  errorElement.textContent = errorMessage;
  errorElement.classList.add("popup__error_visible");
}

function hideInputError(form, input) {
  const errorElement = form.querySelector(`#${input.name}-error`);
  input.classList.remove("popup__input_type_error");
  errorElement.textContent = "";
  errorElement.classList.remove("popup__error_visible");
}

function checkInputValidity(form, input) {
  if (!input.validity.valid) {
    showInputError(form, input, input.validationMessage);
  } else {
    hideInputError(form, input);
  }
}

function toggleButtonState(inputs, button) {
  button.disabled = inputs.some((input) => !input.validity.valid);
}

function setEventListeners(form) {
  const inputs = Array.from(form.querySelectorAll(".popup__input"));
  const button = form.querySelector(".popup__button");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      checkInputValidity(form, input);
      toggleButtonState(inputs, button);
    });
  });

  toggleButtonState(inputs, button);
}

function enableValidation() {
  const forms = document.querySelectorAll(".popup__form");
  forms.forEach(setEventListeners);
}

enableValidation();
loadProfileData(); // Загрузка данных профиля при загрузке страницы
