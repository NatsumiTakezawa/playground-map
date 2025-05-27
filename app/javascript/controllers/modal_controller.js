import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.element.focus();
    this.trapFocus();
  }

  close() {
    this.element.remove();
  }

  backdrop(event) {
    if (event.target === this.element) this.close();
  }

  trapFocus() {
    const focusable = this.element.querySelectorAll(
      'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }
}
