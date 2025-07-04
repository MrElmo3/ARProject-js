# ARProject-js
## 🎮 Juego de **Memoria Química AR**  

> _Un miniproyecto educativo que combina A-Frame + MindAR para aprender las fórmulas de moléculas básicas jugando a un “memory” en Realidad Aumentada._

---

### ¿Cuál es la idea?
El jugador tiene delante varias **tarjetitas** impresas (o en pantalla) que funcionan como _marcadores AR_.  
En cada ronda aparece un objetivo –p. ej. **Agua (H₂O)**– y dispone de **30 s** para **enfocar, al mismo tiempo, todas las cartas-átomo** que forman esa molécula. Cuando la cámara reconoce los marcadores:

* Sobre cada carta se “pega” un **modelo 3D** del átomo correspondiente (H, O, C, …).
* Una barra de progreso muestra cuántos átomos están visibles.
* Si los marca todos antes de que el cronómetro llegue a 0 → ¡gana la ronda!
* Si el tiempo se agota → la ronda se da por fallida, se pasa al siguiente compuesto.

La partida recorre una lista fija de moléculas y lleva un **score** global (aciertos / total).

---

### Flujo de la partida  

| Paso | Acción |
|------|--------|
| 1 | El juego elige el compuesto actual (Agua, Metano, CO₂…) |
| 2 | Crea una escena **A-Frame** con `mindar-image` apuntando a `elements.mind` |
| 3 | Muestra la **UI HUD** (tiempo, objetivo, progreso, puntuación) |
| 4 | Detecta eventos `targetFound` y `targetLost` en cada carta-marcador |
| 5 | Cuando el set de marcadores visibles = nº requerido → **ronda completada** |
| 6 | Actualiza el score, pasa al siguiente compuesto o reinicia al terminar la lista |

---

### Lógica principal (`src/main.js`)

* **Diccionario de moléculas**  
  ```js
  const CHEMICAL_ELEMENTS = {
    'Agua': [ {element:'H', targetIndex:1}, {element:'O', targetIndex:2} ],
    'Metano': [ {element:'C', targetIndex:0}, {element:'H', targetIndex:1} ],
    'Dióxido de Carbono': [ {element:'C', targetIndex:0}, {element:'O', targetIndex:2} ]
  };
  ```
* **`gameState`** controla cronómetro, marcador, progreso y ronda actual.  
* Cada ronda se genera dinámicamente:
  1. `createSceneFor()` → construye `<a-scene>` con `maxTrack = nº de cartas`.
  2. Crea `<a-assets>` y un `<a-entity mindar-image-target>` por carta.
  3. Suscribe eventos para contar `targetFound` / `targetLost`.
* UI overlay se dibuja en DOM puro para no mezclar con WebGL.

---

### Cómo ejecutar

1. `npm install`
2. `npm run dev` (Se levanta la app en `localhost:5173`)
3. Concede acceso a la **cámara**.
4. Se muestra las **imágenes-marcador** que se entrenó en `elements.mind`.
5. ¡Juega!

---

### Sobre los **archivos `.mind`**  
Un archivo `.mind` es el “dataset” que MindAR usa para reconocer imágenes.  
* Cada imagen se exporta con un **`targetIndex`** (0, 1, 2…)  
* Ese índice debe coincidir con el que se pone en `CHEMICAL_ELEMENTS`.  

