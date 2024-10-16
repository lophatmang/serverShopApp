function format(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

module.exports = format;
