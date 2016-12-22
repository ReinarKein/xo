"use strict";

var _dimension  = "100px";
var _players    = ["x", "o"];
var _size       = 3;
var _turn       = 0;

function getSymbol () {
  var currentTurn = _turn;

  if ((_players.length - 1) === _turn) {
    _turn = 0;
  } else {
    _turn++;
  }

  return _players[currentTurn];
}

class RenderEl {
  constructor () {
    this.container = document.createElement("div");
  }

  getStyle () {
    if (!this.css) {
      return "";
    }

    var css = [];

    for (let key in this.css) {
      css.push(`${key}:${this.css[key]};`);
    }

    return css.join("");
  }
  renderTo (renderEl) {
    this.container.setAttribute("style", this.getStyle());

    if (renderEl.container) {
      renderEl = renderEl.container;
    }
    renderEl.appendChild(this.container);
  }
}

class Glyph extends RenderEl {
  constructor () {
    super();

    this._value = null;
    this.css = {
      "flex"    : "0 0 auto",
      "width"   : _dimension,
      "height"  : _dimension,
      "line-height" : _dimension,
      "text-align"  : "center",
      "font-size"   : _dimension
    };

    this.container.innerHTML = getSymbol();
  }
}

class Cell extends RenderEl {
  constructor (options = {}) {
    super();

    this._desk  = options.desk;
    this._row   = options.row;
    this._value = null;

    this.css = {
      "border"  : "1px solid #999",
      "flex"    : "0 0 auto",
      "width"   : _dimension,
      "height"  : _dimension
    };
  }

  click (e) {
    if (this._desk.gameOver) {
      return;
    }

    var el      = e.target;
    var wasted  = el.cloneNode(true);
    var glyph   = new Glyph();

    glyph.renderTo(wasted);
    el.parentNode.replaceChild(wasted, el);

    setTimeout(() => {
      this._desk.checkVictory(wasted);
    }, 0);
  }

  renderTo () {
    super.renderTo.apply(this, arguments);

    this.container.addEventListener("click", this.click.bind(this));
  }
}

class Row extends RenderEl {
  constructor (options = {}) {
    super();

    this._desk  = options.desk;

    this.css = {
      display   : "flex",
      "height"  : _dimension
    };

    this.draw();
  }

  draw () {
    var counter = _size;

    while (counter--) {
      (new Cell({
        desk  : this._desk,
        row   : this
      })).renderTo(this);
    }
  }
}

class XO extends RenderEl {
  constructor (options = {}) {
    super();

    this.gameOver = false;

    _size         = options.size      || _size;
    _dimension    = options.dimension || _dimension;
    _players      = options.players   || _players;
  }

  _checkCorners (el) {
    var winner      = el.textContent;
    var collection  = [];
    var rows        = [].slice.call(el.parentNode.parentNode.children);

    return (new Array(_size)).fill(null).every(function (_null, i) {
      let x = _size - i - 1;

      return  rows[i].children[i].textContent === winner ||
              rows[x].children[x].textContent === winner;
    }) && winner;
  }

  _checkHorizontal (el) {
    var winner    = el.textContent;
    var rowIndex  = 0;
    var _el       = el;

    while ((_el = _el.previousSibling) !== null) {
      rowIndex++;
    }

    var column = [].map.call(el.parentNode.parentNode.children, function (row) {
      return row.children[rowIndex];
    });

    return [].every.call(column, function (el) {
      return el.textContent === winner;
    }) && winner;
  }

  _checkVertical (el) {
    var winner  = el.textContent;
    var row     = el.parentNode;

    return [].every.call(row.children, function (el) {
      return el.textContent === winner;
    }) && winner;
  }

  checkVictory (el) {
    var winner =  this._checkVertical(el)   ||
                  this._checkHorizontal(el) ||
                  this._checkCorners(el);

    if (winner) this.win(winner);
  }

  draw () {
    var counter = _size;

    while (counter--) {
      (new Row({
        desk: this
      })).renderTo(this);
    }
  }

  renderTo () {
    super.renderTo.apply(this, arguments);
    this.draw();
  }

  reset () {
    this.gameOver             = false;
    this.container.innerHTML  = "";

    this.draw();
  }

  win (winner) {
    this.gameOver = true;

    if (confirm(`${winner} - is the winner! Return match?`)) {
      this.reset();
    }
  }
}
