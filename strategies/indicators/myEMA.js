

var Indicator = function(config) {
  this.input = 'price';
  this.period = config.period;
  this.smooth = config.smooth;
  this.result = false;
  this.age = 0;
}

Indicator.prototype.update = function(price) {
  if(this.result === false)
    this.result = price;

  this.age++;
  this.calculate(price);

  return this.result;
}

//    calculation (based on tick/day):
//  EMA = Price(t) * k + EMA(y) * (1 – k)
//  t = today, y = yesterday, N = number of days in EMA, k = 2 / (N+1)
Indicator.prototype.calculate = function(price) {
  // weight factor
  var k = this.smooth / (this.period + 1);

  // yesterday
  var y = this.result;

  // calculation
  this.result = price * k + y * (1 - k);
}

module.exports = Indicator;
