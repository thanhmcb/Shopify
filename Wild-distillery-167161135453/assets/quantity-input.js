class QuantityInput extends HTMLElement {
  constructor() {
    super();

    this._boundAdd = this.add.bind(this);
    this._boundSubtract = this.subtract.bind(this);
    this._boundValidate = this.validate.bind(this);
    this._boundSelect = this._selectInputText.bind(this);
  }

  connectedCallback() {
    this.input = this.querySelector('input[type="number"]');

    this.minus = this.querySelector('button[minus]');
    this.plus = this.querySelector('button[plus]');

    this.min = Number(this.input.getAttribute('min') || 0);
    this.max = Number(this.input.getAttribute('max') || Infinity);
    this.step = Number(this.input.getAttribute('step') || 1);

    setTimeout(() => {
      this.minus.addEventListener('click', this._boundSubtract);
      this.plus.addEventListener('click', this._boundAdd);
      this.input.addEventListener('change', this._boundValidate);
      this.input.addEventListener('select', this._boundSelect);
      this.input.addEventListener('click', this._boundSelect);
    });
  }

  disconnectedCallback() {
    this.minus.removeEventListener('click', this._boundSubtract);
    this.plus.removeEventListener('click', this._boundAdd);
    this.input.removeEventListener('change', this._boundValidate);
    this.input.removeEventListener('select', this._boundSelect);
    this.input.removeEventListener('click', this._boundSelect);
  }

  subtract() {
    const value = Number(this.input.value);
    if (value > this.min) {
      this.input.value = value - Math.min(this.step, value - this.min);
      // this.input.dispatchEvent(new Event('change'));
      this.dispatchEvent(
        new CustomEvent('update', {
          detail: {
            value: this.input.value,
          },
        }),
      );
    }
  }

  add() {
    const value = Number(this.input.value);
    if (value < this.max) {
      this.input.value = value + Math.min(this.step, this.max - value);
      // this.input.dispatchEvent(new Event('change'));
      this.dispatchEvent(
        new CustomEvent('update', {
          detail: {
            value: this.input.value,
          },
        }),
      );
    }
  }

  validate(e) {
    const value = e.target.value;
    const testRegEx = /^[0-9]+$/;

    if (!testRegEx.test(value) || Number(value) < this.min) {
      this.input.value = this.min;
    }

    if (Number(value) > this.max) {
      this.input.value = this.max;
    }

    this.dispatchEvent(
      new CustomEvent('update', {
        detail: {
          value: this.input.value,
        },
      }),
    );
  }

  _selectInputText(e) {
    e.target.select();
  }

  set value(value) {
    this.input.value = Number(value);
  }

  get value() {
    return Number(this.input.value);
  }
}
customElements.define('quantity-input', QuantityInput);
