import initialCards from "./cards.js";

// DOM-узлы
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

// Данные профиля
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");

// Проверка наличия основных DOM-узлов
if (!placesList || !cardTemplate || !editPopup || !newCardPopup) {
  console.error("Ошибка: не найдены основные DOM-узлы.");
}

// Сохранение данных профиля в localStorage
function saveProfileData() {
  localStorage.setItem("profile", JSON.stringify({
    name: profileTitle?.textContent,
    description: profileDescription?.textContent,
  }));
}

// Загрузка данных профиля из localStorage
function loadProfileData() {
  const savedProfile = localStorage.getItem("profile");
  if (savedProfile) {
    const { name, description } = JSON.parse(savedProfile);
    if (profileTitle) profileTitle.textContent = name;
    if (profileDescription) profileDescription.textContent = description;
  }
}

// Сохранение карточек в localStorage
function saveCards(cards) {
  localStorage.setItem("cards", JSON.stringify(cards));
}

// Загрузка карточек из localStorage
function loadCards() {
  const savedCards = localStorage.getItem("cards");
  return savedCards ? JSON.parse(savedCards) : [...initialCards];
}

// Открытие попапа
function openPopup(popup) {
  popup.classList.add("popup_is-opened");
  document.addEventListener("keydown", closePopupOnEsc);
}

// Закрытие попапа
function closePopup(popup) {
  popup.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", closePopupOnEsc);
}

// Закрытие попапа по ESC
function closePopupOnEsc(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) closePopup(openedPopup);
  }
}

// Закрытие попапа по клику на оверлей
document.querySelectorAll(".popup").forEach((popup) => {
  popup.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("popup")) closePopup(popup);
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
  const likeCount = cardElement.querySelector(".card__like-count");

  cardTitle.textContent = data.name;
  cardImage.src = data.link;
  cardImage.alt = data.name;

  if (data.liked) likeButton.classList.add("card__like-button_is-active");
  likeCount.textContent = data.likes || 0;

  deleteButton.addEventListener("click", () => {
    if (window.confirm("Удалить карточку?")) {
      cardElement.remove();
      let cards = loadCards();
      cards = cards.filter((card) => card.link !== data.link);
      saveCards(cards);
    }
  });

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.toggle("card__like-button_is-active");
    let newLikes = data.likes || 0;
    newLikes = isLiked ? newLikes + 1 : newLikes - 1;

    likeCount.textContent = newLikes;
    data.likes = newLikes;

    let cards = loadCards();
    const cardIndex = cards.findIndex((card) => card.link === data.link);
    if (cardIndex !== -1) {
      cards[cardIndex].likes = newLikes;
      cards[cardIndex].liked = isLiked;
      saveCards(cards);
    }
  });

  // Добавляем обработчик для открытия изображения в модальном окне
  cardImage.addEventListener("click", function() {
    openImageModal(this.src); // Открываем изображение в модальном окне
  });

  return cardElement;
}

// Функция открытия модального окна с изображением
function openImageModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const fullImage = document.getElementById("fullImage");
  const closeModal = document.getElementById("closeModal");

  fullImage.src = imageSrc;
  modal.style.display = "block"; // Показываем модальное окно

  // Закрытие модального окна
  closeModal.addEventListener("click", () => {
    modal.style.display = "none"; // Прячем модальное окно
  });

  // Закрытие модального окна при клике на фон
  window.addEventListener("click", function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Рендер карточек
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

  newCardForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const newCard = {
      name: placeInput.value,
      link: linkInput.value,
      liked: false,
      likes: 0,
    };

    if (!newCard.name || !newCard.link) return;

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

// Проверка валидности формы
function checkInputValidity(form) {
  const inputs = Array.from(form.querySelectorAll(".popup__input"));
  const submitButton = form.querySelector(".popup__button");

  const isValid = inputs.every((input) => input.value.trim() !== "");

  if (submitButton) {
    submitButton.disabled = !isValid;
    submitButton.classList.toggle("popup__button_disabled", !isValid);
  }
}

enableValidation();
loadProfileData();
