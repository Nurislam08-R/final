# CustomFigs — Landing page with 3D preview

Лендинг для продажи кастомных 3D-фигурок сотрудников.

## Структура проекта

- `index.html` — главная страница
- `style.css` — стили
- `script.js` — логика формы и интеграции превью
- `three-setup.js` — Three.js сцена и генерация 3D фигурки
- `assets/` — картинки и иконки

## Быстрый запуск локально

Способ 1 — Python HTTP сервер (рекомендуется):

```powershell
cd "C:\Users\Max\OneDrive\Рабочий стол\jojo"
python -m http.server 8000
```

Откройте: http://localhost:8000

Способ 2 — VS Code Live Server:

1. Откройте папку в VS Code
2. Правый клик на `index.html` → Open with Live Server

---

## Как загружать фото и смотреть 3D

1. Прокрутите до раздела "Смотрите свой результат"
2. Загрузите фото сотрудника, выберите параметры и нажмите "Генерировать превью"
3. Если выбрана 3D-режим — увидите интерактивную модель (вращение, зум)

---

## Интеграция реального ИИ для генерации 3D/текстур

В `script.js` есть комментарий и пример того, куда вставить вызов API. Кратко:

- Генерация 2D рендера: OpenAI Images (DALL·E), Midjourney API или Recraft.
- Генерация 3D-модели: можно автоматизировать через пайплайн (например, Blender/Script или Spline API), результат — `.glb` или текстуры.
- Показ 3D на сайте: `three-setup.js` (локальная генерация базовой фигурки), для реальных `.glb` — загрузить через `THREE.GLTFLoader` и заменить `figurine` на загруженный объект.

Примерная схема (сервер):

1. Клиент загружает фото + параметры
2. Сервер отправляет job в ИИ-сервис (Midjourney/DALL·E/Recraft/Spline)
3. Сервис возвращает URL `image` или `model.glb`
4. Сервер возвращает клиенту URL, клиент подгружает и отображает:
   - `<img>` для 2D
   - `THREE.GLTFLoader` для `.glb`

Пример замены в `script.js` (в комментариях):

```js
// fetch('https://your-server/api/generate', { method: 'POST', body: formData })
//  .then(r => r.json())
//  .then(data => {
//     // если data.type === 'glb' — загрузить через GLTFLoader
//     // если data.type === 'image' — показать <img>
//  })
```

---

## Пример: загрузка `.glb` в `three-setup.js`

В `three-setup.js` вы можете подключить `GLTFLoader` и заменить `createDefaultFigurine()` вызовом загрузки:

```js
// const loader = new THREE.GLTFLoader();
// loader.load('https://.../model.glb', gltf => { scene.add(gltf.scene); });
```

> Примечание: для загрузки `.glb` может потребоваться подключение `GLTFLoader` (three/examples/jsm/loaders/GLTFLoader.js)

---

## CI (GitHub Actions)

Добавлен простой workflow который проверяет наличие основных файлов на push.

---

Если хотите — могу добавить
- пример сервера (FastAPI / Express) для отправки фото в ИИ и получения `.glb`/рендера
- пример загрузчика `.glb` в `three-setup.js`
- README дополнительно с инструкцией по разворачиванию на GitHub Pages

Скажите, что добавить следующим шагом.