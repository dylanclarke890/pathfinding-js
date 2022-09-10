var PF = PF || {};
PF.UI = PF.UI || {};

PF.UI.Button = class {
  constructor({ x, y, w, h, font, text, textColor, bgColor, onClick }) {
    this.x = x;
    this.y = y;
    this.w = w || 100;
    this.h = h || 20;
    this.text = text || "";
    this.font = font || "20px Arial";
    this.textColor = textColor || "white";
    this.bgColor = bgColor || black;
    this.onClick = onClick || (() => null);
  }

  draw() {
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = this.textColor;
    ctx.font = this.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2);
  }

  clicked(e) {
    this.onClick(this, e);
  }
};
