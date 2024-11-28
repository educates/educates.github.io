import { init } from "ityped";

export function initializeItyped(itypedStrings: string[]): void {
  const element = document.querySelector("#ityped");
  if (element) {
    init(element, {
      strings: itypedStrings,
      typeSpeed: 100,
      backSpeed: 50,
      loop: true,
    });
  }
}
