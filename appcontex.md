# 📄 Product Requirements Document (PRD) – Logistics Investment Optimizer

## 🧭 Visión General

Desarrollar una aplicación web escalable y modular denominada **Logistics Investment Optimizer**, que permita a importadores, comerciantes y viajeros optimizar su rentabilidad al transportar bienes, modelando con precisión el uso del espacio, costos logísticos, reventa, velocidad de rotación y condiciones del mercado.

---

## 🧑‍💼 Stakeholders

* Fundador/Product Owner
* Equipo de desarrollo frontend/backend
* Equipo de UX/UI
* Equipo de marketing
* Usuario final (comerciante, importador, viajero frecuente)

---

## 🎯 Objetivos

* Calcular el score de rentabilidad de transportar productos según volumen, peso, valor de reventa y velocidad de rotación.
* Permitir simulaciones avanzadas de mercado, competencia y saturación.
* Diferenciar claramente entre usuarios gratuitos y premium.
* Permitir integración con herramientas del ecosistema e-commerce (Amazon, Shopify, MercadoLibre).

---

## 🏗️ Funcionalidades Principales

### 🏠 Home Page

* Branding: Logistics Investment Optimizer
* Frase de valor e íconos de confianza (Amazon, MercadoLibre, Shopify, etc.)
* CTA directo: “Empezar a Calcular”
* Responsive

### 🔐 Modelo Freemium

**Free:**

* Crear un solo shipment con productos y múltiples contenedores.
* Score, score eficiencia, profit margin básico.
* Configuración de moneda, idioma, sistema métrico.

**Premium:**

* Guardar, editar y duplicar múltiples envíos.
* Comparaciones visuales entre shipments.
* Dumping penalizer y días simulados.
* IA (DeepSeek) para autocompletar dimensiones.
* Presets de mercado (40 países editables).
* Simulación de competencia, dumping, frecuencia.
* Descuentos por cantidad.
* Modelos de demanda avanzados.
* Segmentación por tipo de bien.
* Incoterms.
* Integraciones API: Amazon SP-API, Shopify, MercadoLibre, Keepa.

### ⚙️ Configuración Global

* Idioma, moneda, sistema métrico/imperial.
* Tooltips explicativos en toda la interfaz.

### 📦 Productos

* Agregar múltiples productos por shipment.
* Campos: dimensiones, peso, precio de compra/reventa, días para vender, cantidad, tag, ¿está en caja?, autocompletar IA (Premium).
* Descuentos por cantidad (Premium).

### 🚛 Contenedores

* Agregar múltiples contenedores por shipment.
* Campos: nombre, dimensiones, peso máximo, tag, duración estimada, costo de envío obligatorio (default: \$0).
* Soporte para drag & drop de productos a contenedores.
* Validación automática de volumen/peso por contenedor.
* Presets editables: marítimos, aéreos, cajas estándar, equipaje.

### 📊 Resultados y Score

* Por producto: volumen, ganancia, score, score eficiencia.
* Por shipment: score principal, profit margin, dumping penalizado, días simulados, score eficiencia, exportar CSV (Premium).

### 🚫 Dumping Penalizer (Premium)

* Penaliza saturación de producto.
* Afecta score y días simulados.
* Toggle + explicación en tooltip.
* Fórmulas logarítmicas predefinidas.

### 📈 Modelos de Demanda (Premium)

* Lineal (default), logarítmico, elasticidad, econométrico.
* Cambiables por ítem.

### 🌍 Mercados (Premium)

* Asignar mercados objetivo a cada shipment.
* 40 presets de países editables (demanda, escasez, competencia, impuestos).
* Segmentación por tipo de bien.

### 🗓️ Fechas y Frecuencia

* Fecha de salida del shipment.
* Frecuencia: único, semanal, mensual.
* Envíos concurrentes afectan score (dumping cruzado).

### ⚖️ Comparación de Shipments (Premium)

* Comparación A vs B de: score, eficiencia, dumping, profit margin, días simulados.

### ⚡️ Competencia Simulada (Premium)

* Simulación de impacto por competidores ficticios en score, dumping y reventa.

### 📄 Incoterms (Premium)

* Dropdown informativo: EXW, FOB, CIF, DDP, etc.
* No afecta score directamente.

### 🔌 Integraciones Premium

* DeepSeek (OpenRouter): autocompletar dimensiones.
* Keepa: precios y BSR Amazon.
* Amazon SP-API, Shopify, MercadoLibre APIs.

---

## 🧰 Stack Técnico

* **Frontend**: React / Next.js (Vercel)
* **Backend**: Serverless (Vercel)
* **Base de datos**: Supabase
* **Auth**: Supabase
* **Pagos**: Stripe
* **UI**: Sidebar tipo ChatGPT, responsive, tooltips

---

## 📌 Notas Adicionales

* Todos los presets deben ser editables después de cargados.
* Todo valor con impacto relevante debe tener tooltip explicativo.
* Se debe poder visualizar y editar la estructura de cada envío con claridad.

---

Este PRD sirve como guía integral para el desarrollo, priorización y validación de funcionalidades en el producto Logistics Investment Optimizer.
