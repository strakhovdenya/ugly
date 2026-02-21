# geometry (g)

Этот проект использует ES-модули (`type="module"`), поэтому файл нужно открывать через локальный сервер, а не по `file://`.

Запуск локального сервера (Windows, PowerShell) из папки проекта:

```powershell
python -m http.server 8000
```

Открыть в браузере:

```
http://localhost:8000/
```

Если Python не установлен, можно использовать Node.js:

```powershell
npx http-server -p 8000
```

Или установить простой dev-скрипт через npm:

```powershell
npm init -y
npm i -D http-server
```

В `package.json` добавить:

```json
{
  "scripts": {
    "dev": "http-server -p 8000"
  }
}
```

Запуск:

```powershell
npm run dev
```
