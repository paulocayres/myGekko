var _ = require('lodash');
var log = require('../core/log.js');

var myEMA = require('./indicators/myEMA.js');

// configuration
var config = require('../core/util.js').getConfig();
var settings = config.myEMA;
var persistence = settings.persistence;

//Estatégia com Média movel exponencial.
var strat = {};

// Prepare everything our strat needs
strat.init = function () {

  this.name = 'myEMA';
  this.requiredHistory = config.tradingAdvisor.historySize;

  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  // define the indicators we need
  this.addIndicator('myema', 'myEMA', settings);
}

// What happens on every new candle?
/* strat.update = function (candle) {

} */

// For debugging purposes.
strat.log = function () {
  log.debug('teste');
}

// Based on the newly calculated
// information, check if we should
// update or not.
/* strat.check = function (candle) {
  this.ema = this.indicators.myema;

  if (candle.close > this.ema.result) {

    if (this.trend.direction !== 'high')
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'high',
        adviced: false
      };

    this.trend.duration++;

    if (this.trend.duration >= this.settings.persistence)
      this.trend.persisted = true;

    if (this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('long');
    } else {
      this.advice();
    }


  } else if (candle.close < this.ema.result) {
    if (this.trend.direction !== 'low')
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'low',
        adviced: false
      };

    this.trend.duration++;

    if (this.trend.duration >= this.settings.persistence)
      this.trend.persisted = true;

    if (this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('short');
    } else {
      this.advice();
    }

  } else {
    this.advice();
  }

}
 */

strat.check = function(candle) {
  var price = this.lastPrice;
  var ema = this.indicators.myema;


  var result = ema.result;

  if(candle.close > result) {

    // new trend detected
    if(this.trend.direction !== 'up')
      // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'up',
        adviced: false
      };

    this.trend.duration++;

    log.debug('In uptrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= persistence)
      this.trend.persisted = true;

    if(this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('long');
    } else
      this.advice();

  } else if(candle.close < result) {

    // new trend detected
    if(this.trend.direction !== 'down')
      // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'down',
        adviced: false
      };

    this.trend.duration++;

    log.debug('In downtrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= persistence)
      this.trend.persisted = true;

    if(this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('short');
    } else
      this.advice();

  } else {

    log.debug('In no trend');

    // we're not in an up nor in a downtrend
    // but for now we ignore sideways trends
    //
    // read more @link:
    //
    // https://github.com/askmike/gekko/issues/171

    // this.trend = {
    //   direction: 'none',
    //   duration: 0,
    //   persisted: false,
    //   adviced: false
    // };

    this.advice();
  }
}
module.exports = strat;
