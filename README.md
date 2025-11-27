# UTN – E‑Commerce Mock (Angular + JSON Server)

Catálogo, cuentas y administración simulados con Angular consumiendo un backend mock en JSON Server.

## 📌 Qué hace
- Catálogo con búsqueda por título/categoría/tags y detalle de producto.
- Carrito con persistencia por usuario, ajuste de cantidades y checkout (placeholder).
- Autenticación y roles: `user`, `user-seller`, `business`, `admin` (credenciales en `db.json`).
- Panel “Mi cuenta”: datos personales, upgrade a seller, gestión de perfil.
- Panel “Mis productos” (seller/business): alta/edición, precio/stock/descuento, tags, deshabilitar/habilitar/eliminar.
- Panel Admin: gestión de cuentas (ban/unban/delete) y productos (habilitar/deshabilitar/eliminar).

## 🔐 Auth y guards
- Login con credenciales del JSON.
- Guards por rol en rutas sensibles (`cart`, `accountProducts`, `admin`).
- Botones y acciones condicionadas por `ownerId`/`role` (no compras tu propio producto, etc.).

## 🛒 Carrito
- Añadir desde detalle; “Comprar ahora” envía al carrito.
- Persistencia por `userId`, ajuste de cantidades y eliminación.
- Acceso solo para roles que pueden comprar.

## 🧰 Stack
- Angular 20+, Signals y Reactive Forms.
- JSON Server como backend (`database/db.json`).
- TypeScript estricto, rutas standalone.

## 📂 Rutas y módulos
- `/home` catálogo destacado.
- `/search` búsqueda.
- `/product/:id` detalle.
- `/account` menú de cuenta.
- `/accountDetails` perfil.
- `/accountProducts` gestión de productos (seller/business).
- `/cart` carrito de compras.
- `/checkout` (placeholder).
- `/admin/accountsManagment`, `/admin/productsManagment` gestion de cuentas/ productos.

## ⚙️ Instalación rápida
```bash
npm install
# backend 
npx json-server --watch database/db.json --port 3000
# frontend
npm start
```

## ▶️ Uso
- Logueate con un usuario del `db.json`.
- Explora catálogo, busca por tags/categoría, abre un producto.
- “Comprar ahora” lleva al carrito; desde “Mis productos” crea/edita/borra.
- Admin modera cuentas y productos.


## 👥 Autores
Axel Llobet, Ezequiel Martinez y Enzo Sansalone
