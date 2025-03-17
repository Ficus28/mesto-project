import initialCards from "./cards.js";

// DOM узлы
const placesList = document.querySelector(".places__list");
const cardTemplate = document.querySelector("#card-template")?.content;

// Попапы
const editPopup = document.querySelector(".popup_type_edit");
const newCardPopup = document.querySelector(".popup_type_new-card");

// Кнопки
const editButton = document.querySelector(".profile__edit-button");
const addButton = document.querySelector(".profile__add-button");
const closeButtons = document.querySelectorAll(".popup__close");

// Формы
const editForm = editPopup?.querySelector(".popup__form");
const nameInput = editPopup?.querySelector(".popup__input_type_name");
const jobInput = editPopup?.querySelector(".popup__input_type_description");

const newCardForm = newCardPopup?.querySelector(".popup__form");
const placeInput = newCardForm?.querySelector(".popup__input_type_card-name");
const linkInput = newCardForm?.querySelector(".popup__input_type_url");
const submitButton = newCardForm?.querySelector(".popup__button");

// Данные профиля
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");

// Проверка наличия обязательных элементов
if (!placesList || !cardTemplate || !editPopup || !newCardPopup) {
  console.error("Ошибка: не найдены основные DOM-узлы.");
}

// Функция сохранения данных профиля в localStorage
function saveProfileData() {
  localStorage.setItem("profile", JSON.stringify({
    name: profileTitle?.textContent,
    description: profileDescription?.textContent,
  }));
}

// Функция загрузки данных профиля из localStorage
function loadProfileData() {
  const savedProfile = localStorage.getItem("profile");
  if (savedProfile) {
    const { name, description } = JSON.parse(savedProfile);
    if (profileTitle) profileTitle.textContent = name;
    if (profileDescription) profileDescription.textContent = description;
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
document.querySelectorAll(".popup").forEach((popup) => {
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
if (editButton && editForm) {
  editButton.addEventListener("click", () => {
    if (nameInput && profileTitle) nameInput.value = profileTitle.textContent;
    if (jobInput && profileDescription) jobInput.value = profileDescription.textContent;
    openPopup(editPopup);
  });

  editForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    if (profileTitle && nameInput) profileTitle.textContent = nameInput.value;
    if (profileDescription && jobInput) profileDescription.textContent = jobInput.value;
    saveProfileData();
    closePopup(editPopup);
  });
}

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

  // Восстановление состояния лайка
  if (data.liked) {
    likeButton.classList.add("card__like-button_active");
  }

  // Обработчик удаления карточки с подтверждением
  deleteButton.addEventListener("click", () => {
    if (window.confirm("Вы уверены, что хотите удалить эту карточку?")) {
      cardElement.remove();
      let cards = loadCards();
      cards = cards.filter((card) => card.link !== data.link);
      saveCards(cards);
    }
  });

  // Обработчик лайка
  likeButton.addEventListener("click", () => {
    likeButton.classList.toggle("card__like-button_active");
    let cards = loadCards();
    const cardIndex = cards.findIndex(card => card.link === data.link);
    if (cardIndex !== -1) {
      cards[cardIndex].liked = likeButton.classList.contains("card__like-button_active");
      saveCards(cards);
    }
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
if (addButton && newCardForm) {
  addButton.addEventListener("click", () => {
    newCardForm.reset();
    checkInputValidity(newCardForm);
    openPopup(newCardPopup);
  });

  // Обработчик добавления новой карточки
  newCardForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const newCard = {
      name: placeInput.value,
      link: linkInput.value,
      liked: false,
    };

    // Проверка на пустые значения
    if (!newCard.name || !newCard.link) {
      return;
    }

    // Загружаем текущие карточки, добавляем новую и сохраняем
    const updatedCards = [newCard, ...loadCards()];
    saveCards(updatedCards);

    const cardElement = createCard(newCard);
    placesList.prepend(cardElement);
    closePopup(newCardPopup);
  });
}

// Функция валидации формы
function enableValidation() {
  document.querySelectorAll(".popup__form").forEach((form) => {
    form.addEventListener("input", () => checkInputValidity(form));
  });
}

// Проверка валидности формы и управление кнопкой
function checkInputValidity(form) {
  const inputs = Array.from(form.querySelectorAll(".popup__input"));
  const submitButton = form.querySelector(".popup__button");

  const isValid = inputs.every((input) => input.value.trim() !== "");

  if (submitButton) {
    submitButton.disabled = !isValid;
    submitButton.classList.toggle("popup__button_disabled", !isValid);
  }
}

// Включаем валидацию
enableValidation();
loadProfileData();
