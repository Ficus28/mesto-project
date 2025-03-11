import initialCards from "./cards.js";

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
const placeInput = newCardPopup.querySelector(".popup__input_type_card-name");
const linkInput = newCardPopup.querySelector(".popup__input_type_url");

// Данные профиля
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");

// Функция открытия попапа
function openPopup(popup) {
  popup.classList.add("popup_is-opened");
}

// Функция закрытия попапа
function closePopup(popup) {
  popup.classList.remove("popup_is-opened");
}

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
  closePopup(editPopup);
});

// Функция создания карточки
function createCard(data) {
  const cardElement = cardTemplate.cloneNode(true);
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
  });

  // Обработчик лайка
  likeButton.addEventListener("click", () => {
    likeButton.classList.toggle("card__like-button_active");
  });

  return cardElement;
}

// Функция рендера карточек
function renderCards() {
  initialCards.forEach((cardData) => {
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
  const cardElement = createCard(newCard);
  placesList.prepend(cardElement);
  closePopup(newCardPopup);
});

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
  