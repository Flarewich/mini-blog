import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UiContext = createContext(null);

const dict = {
  ru: {
    // navbar
    posts: "Посты",
    newPost: "Новый пост",
    profile: "Профиль",
    logout: "Выйти",
    login: "Вход",
    theme: "Тема",
    language: "Язык",
    dark: "Тёмная",
    light: "Светлая",

    // feed
    allPosts: "Все посты",
    refresh: "Обновить",
    noPosts: "Постов пока нет. Создай первый 🙂",
    realtimeOn: "Realtime включён.",
    loading: "Загрузка...",

    // post actions
    edit: "Редактировать",
    delete: "Удалить",
    deletePostConfirm: "Удалить пост?",
    commentsBtn: "Комментарии",
    likeLoginRequired: "Войди, чтобы ставить лайки.",
    commentLoginRequired: "Войди, чтобы комментировать.",

    // editor
    newPostTitle: "Новый пост",
    editPostTitle: "Редактирование",
    saving: "Сохранение...",
    save: "Сохранить",
    saveError: "Ошибка сохранения",

    // form
    postTitleLabel: "Заголовок",
    postTitlePlaceholder: "Например: Мой первый пост",
    postContentLabel: "Текст",
    postContentPlaceholder: "Пиши что угодно 🙂",

    // auth
    authLoginTitle: "Вход",
    authSignupTitle: "Регистрация",
    authSubtitle: "Supabase Auth (email + пароль)",
    emailLabel: "Email",
    passwordLabel: "Пароль",
    loginBtn: "Войти",
    signupBtn: "Создать аккаунт",
    waitBtn: "Подожди...",
    noAccount: "Нет аккаунта? Зарегистрироваться",
    haveAccount: "Уже есть аккаунт? Войти",
    signupSuccess: "Аккаунт создан. Проверь почту (если включено подтверждение) или войди.",
    repeatIn: "Можно повторить через {s}с",

    // profile
    avatar: "Аватар",
    uploadAvatar: "Загрузить аватар",
    noAvatar: "Нет аватара",
    username: "Username",
    fullName: "Full name",
    website: "Website",
    profileSaved: "Профиль сохранён.",
    profileLoadError: "Не удалось загрузить профиль",
    profileSaveError: "Ошибка сохранения профиля",
    avatarLinkedError: "Не удалось привязать аватар",
    avatarUploaded: "Аватар загружен.",
    selectImage: "Выбери картинку (jpg/png/webp).",
    fileTooBig: "Файл слишком большой (макс 2MB).",
    uploadError: "Ошибка загрузки",

    // comments
    commentsTitle: "Комментарии",
    commentPlaceholder: "Написать комментарий...",
    commentPlaceholderGuest: "Войди, чтобы комментировать",
    send: "Отправить",
    noComments: "Комментариев пока нет.",
    deleteCommentConfirm: "Удалить комментарий?",
    deleteSmall: "удалить",

    // misc
    notFoundTitle: "404",
    notFoundText: "Страница не найдена.",
    backHome: "На главную",

    // generic
    errorUpdate: "Ошибка обновления",
  },

  ua: {
    posts: "Пости",
    newPost: "Новий пост",
    profile: "Профіль",
    logout: "Вийти",
    login: "Вхід",
    theme: "Тема",
    language: "Мова",
    dark: "Темна",
    light: "Світла",

    allPosts: "Усі пости",
    refresh: "Оновити",
    noPosts: "Постів поки немає. Створи перший 🙂",
    realtimeOn: "Realtime увімкнено.",
    loading: "Завантаження...",

    edit: "Редагувати",
    delete: "Видалити",
    deletePostConfirm: "Видалити пост?",
    commentsBtn: "Коментарі",
    likeLoginRequired: "Увійди, щоб ставити вподобайки.",
    commentLoginRequired: "Увійди, щоб коментувати.",

    newPostTitle: "Новий пост",
    editPostTitle: "Редагування",
    saving: "Збереження...",
    save: "Зберегти",
    saveError: "Помилка збереження",

    postTitleLabel: "Заголовок",
    postTitlePlaceholder: "Наприклад: Мій перший пост",
    postContentLabel: "Текст",
    postContentPlaceholder: "Пиши що завгодно 🙂",

    authLoginTitle: "Вхід",
    authSignupTitle: "Реєстрація",
    authSubtitle: "Supabase Auth (email + пароль)",
    emailLabel: "Email",
    passwordLabel: "Пароль",
    loginBtn: "Увійти",
    signupBtn: "Створити акаунт",
    waitBtn: "Зачекай...",
    noAccount: "Немає акаунта? Зареєструватися",
    haveAccount: "Вже є акаунт? Увійти",
    signupSuccess: "Акаунт створено. Перевір пошту (якщо ввімкнене підтвердження) або увійди.",
    repeatIn: "Можна повторити через {s}с",

    avatar: "Аватар",
    uploadAvatar: "Завантажити аватар",
    noAvatar: "Немає аватара",
    username: "Username",
    fullName: "Повне ім’я",
    website: "Сайт",
    profileSaved: "Профіль збережено.",
    profileLoadError: "Не вдалося завантажити профіль",
    profileSaveError: "Помилка збереження профілю",
    avatarLinkedError: "Не вдалося прив’язати аватар",
    avatarUploaded: "Аватар завантажено.",
    selectImage: "Обери картинку (jpg/png/webp).",
    fileTooBig: "Файл завеликий (макс 2MB).",
    uploadError: "Помилка завантаження",

    commentsTitle: "Коментарі",
    commentPlaceholder: "Написати коментар...",
    commentPlaceholderGuest: "Увійди, щоб коментувати",
    send: "Надіслати",
    noComments: "Коментарів поки немає.",
    deleteCommentConfirm: "Видалити коментар?",
    deleteSmall: "видалити",

    notFoundTitle: "404",
    notFoundText: "Сторінку не знайдено.",
    backHome: "На головну",

    errorUpdate: "Помилка оновлення",
  },

  en: {
    posts: "Posts",
    newPost: "New post",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    theme: "Theme",
    language: "Language",
    dark: "Dark",
    light: "Light",

    allPosts: "All posts",
    refresh: "Refresh",
    noPosts: "No posts yet. Create your first 🙂",
    realtimeOn: "Realtime enabled.",
    loading: "Loading...",

    edit: "Edit",
    delete: "Delete",
    deletePostConfirm: "Delete this post?",
    commentsBtn: "Comments",
    likeLoginRequired: "Please log in to like posts.",
    commentLoginRequired: "Please log in to comment.",

    newPostTitle: "New post",
    editPostTitle: "Edit post",
    saving: "Saving...",
    save: "Save",
    saveError: "Save error",

    postTitleLabel: "Title",
    postTitlePlaceholder: "e.g. My first post",
    postContentLabel: "Content",
    postContentPlaceholder: "Write anything 🙂",

    authLoginTitle: "Login",
    authSignupTitle: "Sign up",
    authSubtitle: "Supabase Auth (email + password)",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginBtn: "Login",
    signupBtn: "Create account",
    waitBtn: "Please wait...",
    noAccount: "No account? Sign up",
    haveAccount: "Already have an account? Login",
    signupSuccess: "Account created. Check your email (if confirmation is enabled) or log in.",
    repeatIn: "Try again in {s}s",

    avatar: "Avatar",
    uploadAvatar: "Upload avatar",
    noAvatar: "No avatar",
    username: "Username",
    fullName: "Full name",
    website: "Website",
    profileSaved: "Profile saved.",
    profileLoadError: "Failed to load profile",
    profileSaveError: "Failed to save profile",
    avatarLinkedError: "Failed to link avatar",
    avatarUploaded: "Avatar uploaded.",
    selectImage: "Choose an image (jpg/png/webp).",
    fileTooBig: "File is too large (max 2MB).",
    uploadError: "Upload error",

    commentsTitle: "Comments",
    commentPlaceholder: "Write a comment...",
    commentPlaceholderGuest: "Log in to comment",
    send: "Send",
    noComments: "No comments yet.",
    deleteCommentConfirm: "Delete this comment?",
    deleteSmall: "delete",

    notFoundTitle: "404",
    notFoundText: "Page not found.",
    backHome: "Back home",

    errorUpdate: "Update error",
  },
};

export function UiProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ru");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => localStorage.setItem("lang", lang), [lang]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // t(key, {var}) поддерживает шаблоны вида "Через {s}с"
  function t(key, vars) {
    const str = dict[lang]?.[key] ?? dict.ru[key] ?? key;
    if (!vars) return str;
    return Object.keys(vars).reduce(
      (acc, k) => acc.replaceAll(`{${k}}`, String(vars[k])),
      str
    );
  }

  const value = useMemo(() => ({ lang, setLang, theme, setTheme, t }), [lang, theme]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}
