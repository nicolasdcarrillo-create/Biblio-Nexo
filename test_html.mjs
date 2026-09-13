import { html } from './src/js/modules/utilidades.js';

const b = { stock: 1, id: 123 };
const template = html`
  <div class="flex flex-wrap gap-2 justify-end">
    ${b.stock > 0
      ? html`<button class="loan-book-btn" data-id="${b.id}">Prestar</button>`
      : html`<button class="reserve-book-btn" data-id="${b.id}">Reservar</button>`}
  </div>
`;
console.log(template.toString());
