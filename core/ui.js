var PF = PF || {};
PF.UI = PF.UI || {};

PF.UI.Button = class {
  constructor({ x, y, w, h, font, text, textColor, bgColor, onClick }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.font = font;
    this.textColor = textColor;
    this.bgColor = bgColor;
    this.onClick = onClick;
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
    this.onClick(e);
  }
};
