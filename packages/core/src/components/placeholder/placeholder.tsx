import { Component, Prop, h } from "@stencil/core";

@Component({
  tag: "hero-placeholder",
  styleUrl: "placeholder.css",
  shadow: true,
})
export class Placeholder {
  @Prop() name: string = "Hero AntD";

  render() {
    return <div class="placeholder">Welcome to {this.name}</div>;
  }
}
