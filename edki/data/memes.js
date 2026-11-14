/* Меми на сайті. Усе редагується тут, код чіпати не треба.
 *
 * enabled: false           — вимкнути всі меми одразу.
 * items: кожен запис — одна картинка:
 *   src     — шлях до файлу в теці memes/ АБО повне посилання https://... на картинку з інтернету;
 *   alt     — опис для екранних читалок;
 *   caption — підпис під картинкою (можна залишити порожнім "");
 *   where   — де показувати (можна кілька місць):
 *               "home"         титульний екран
 *               "tests"        сторінка зі списком тестів
 *               "start"        перед початком тесту
 *               "result-high"  результат 80 % і більше
 *               "result-mid"   результат 50–79 %
 *               "result-low"   результат менше 50 %
 *               "past"         сторінка «Минулі роки» (зараз мемів тут немає)
 *   style   — "sticker" (наліпка з нахилом), "card" (картинка на всю ширину) або "plain" (без рамки, для прозорих PNG/SVG).
 *
 * Якщо на одне місце є кілька мемів, щоразу показується випадковий.
 * Щоб додати свій: покладіть файл у memes/ і допишіть запис нижче.
 */
(function () {
  window.EDKI = window.EDKI || { tests: [], past: [] };
  window.EDKI.memes = {
    enabled: true,
    items: [
      { src: "memes/climber.svg", alt: "Мандрівник у плащі з сяючим мечем", caption: "", where: ["home"], style: "plain" },
      { src: "memes/polite-cat.jpg", alt: "Кіт зі складеними людськими руками", caption: "Я вірю, що ви повторили алгоритм Евкліда.", where: ["start"], style: "sticker" },
      { src: "memes/polite-cat.jpg", alt: "Кіт зі складеними людськими руками", caption: "Шановні, а де обернений за модулем?", where: ["result-low"], style: "sticker" },
      { src: "memes/polite-cat.jpg", alt: "Кіт зі складеними людськими руками", caption: "Непогано. Але розбір помилок я все ж прочитав би.", where: ["result-mid"], style: "sticker" },
      { src: "memes/cryptocats.jpg", alt: "Котики навколо каменя з сяючим ключем", caption: "Секретний ключ знайдено. Вітаю!", where: ["result-high"], style: "card" },
      { src: "memes/cryptocats.jpg", alt: "Котики навколо каменя з сяючим ключем", caption: "", where: ["tests"], style: "card" }
    ]
  };
})();
